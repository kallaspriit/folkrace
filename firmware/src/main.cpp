#include <mbed.h>
#include <USBSerial.h>

#include "WS2812.h"
#include "PixelArray.h"
#include "Commander.hpp"
#include "RoboClaw.hpp"
#include "Lidar.hpp"
#include "DebouncedInterruptIn.hpp"

// pin mapping configuration
const PinName LOG_SERIAL_TX_PIN = USBTX;
const PinName LOG_SERIAL_RX_PIN = USBRX;
const PinName APP_SERIAL_TX_PIN = p9;
const PinName APP_SERIAL_RX_PIN = p10;
const PinName MOTOR_SERIAL_TX_PIN = p13;
const PinName MOTOR_SERIAL_RX_PIN = p14;
const PinName LIDAR_PWM_PIN = p21;
const PinName LIDAR_TX_PIN = p28;
const PinName LIDAR_RX_PIN = p27;
const PinName START_SWITCH_PIN = p18;
const PinName LEFT_BUMPER_PIN = p17;
const PinName RIGHT_BUMPER_PIN = p16;
const PinName REAR_LED_STRIP_DATA_PIN = p15;
const PinName USB_POWER_SENSE_PIN = p22;

// baud rates configuration
const int LOG_SERIAL_BAUDRATE = 921600;   // log serial is the built-in usb of the mbed board
const int MOTOR_SERIAL_BAUDRATE = 460800; // not default, make sure to update in the Ion Studio

// timing configuration
const int REPORT_ENCODER_VALUES_INTERVAL_MS = 1000; // larger interval for testing
const int APP_MESSAGE_SENT_BLINK_DURATION_MS = 10;  // for how long to turn off the usb status led while transmitting
const int LOOP_LED_INTERVAL_MS = 1000;
const int LOOP_LED_BLINK_DURATION_MS = 10;
const int BUTTON_DEBOUNCE_US = 100000; // 100ms

// component configuration
const uint8_t MOTOR_SERIAL_ADDRESS = 128;

// voltage measurement correction configuration
const double MAIN_VOLTAGE_CORRECTION_MULTIPLIER = 1.02;

// usb serial configuration (simulate ARM mbed board)
const uint16_t USB_VENDOR_ID = 0x0d28;  // ARM
const uint16_t USB_PRODUCT_ID = 0x0204; // mbed
const uint16_t USB_PRODUCT_RELEASE = 0x0001;

// rear led configuration
const int REAR_LED_COUNT = 8;

// WS2812 led driver timing NOP counts for timing
const int WS2812_ZERO_HIGH_LENGTH = 3;
const int WS2812_ZERO_LOW_LENGTH = 11;
const int WS2812_ONE_HIGH_LENGTH = 10;
const int WS2812_ONE_LOW_LENGTH = 11;

// setup serials
Serial logSerial(LOG_SERIAL_TX_PIN, USBRX, LOG_SERIAL_BAUDRATE);
// Serial appSerial(APP_SERIAL_TX_PIN, APP_SERIAL_RX_PIN, APP_SERIAL_BAUDRATE);
USBSerial appSerial(USB_VENDOR_ID, USB_PRODUCT_ID, USB_PRODUCT_RELEASE, false);

// setup commanders (handle serial commands)
Commander logCommander(&logSerial);
Commander appCommander(&appSerial);

// setup motor controller
RoboClaw motors(MOTOR_SERIAL_ADDRESS, MOTOR_SERIAL_BAUDRATE, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_TX_PIN);

// setup lidar
Lidar lidar(LIDAR_TX_PIN, LIDAR_RX_PIN, LIDAR_PWM_PIN);

// setup timers
Timer reportEncoderValuesTimer;
Timer loopTimer;
Timer loopLedTimer;
Timer rearLedUpdateTimer;
Timer appMessageSentTimer;
Timer debugTimer;

// setup status leds
DigitalOut loopStatusLed(LED1);
DigitalOut usbStatusLed(LED2);

// setup usb power sense (usb serial knows when it gets connected but not when disconnected)
DigitalIn usbPowerSense(USB_POWER_SENSE_PIN);

// setup rear led strip
WS2812 rearLedController(REAR_LED_STRIP_DATA_PIN, REAR_LED_COUNT, WS2812_ZERO_HIGH_LENGTH, WS2812_ZERO_LOW_LENGTH, WS2812_ONE_HIGH_LENGTH, WS2812_ONE_LOW_LENGTH);
PixelArray rearLedStrip(REAR_LED_COUNT);

// setup buttons
DebouncedInterruptIn startButton(START_SWITCH_PIN, PullUp, BUTTON_DEBOUNCE_US);
DebouncedInterruptIn leftBumper(LEFT_BUMPER_PIN, PullUp, BUTTON_DEBOUNCE_US);
DebouncedInterruptIn rightBumper(RIGHT_BUMPER_PIN, PullUp, BUTTON_DEBOUNCE_US);

// keep track of encoder values
int lastEncoderDeltaM1 = 0;
int lastEncoderDeltaM2 = 0;

// track button state changes (default to unknown)
int lastStartButtonState = -1;
int lastLeftBumperState = -1;
int lastRightBumperState = -1;

// track whether the rear led strip requires update
bool rearLedNeedsUpdate = false;

// track usb connection state
bool wasUsbConnected = false;

// track target speeds
int targetSpeedM1 = 0;
int targetSpeedM2 = 0;

// keep track of last loop time in microseconds
int lastLoopTimeUs = 0;

// keep track of last loop led state and cycle count
int lastLoopLedState = 0;
int cycleCountSinceLastLoopBlink = 0;

// returns whether usb serial is connected
bool isUsbConnected()
{
  // get both whether power from the OTG device is detected and serial connection state
  bool isUsbPowerPresent = usbPowerSense.read() == 1;
  bool isUsbReportingConnected = appSerial.connected();

  // require both usb power to be present as well as usb to report as connected (as usb fails to detect disconnects)
  return isUsbPowerPresent && isUsbReportingConnected;
}

// writes app message using either blocking or non-blocking method (consider send instead as it supports printf arguments)
void sendRaw(const char *message, int length, bool blocking = true)
{
  // don't attempt to send if not connected as writing is blocking
  if (!isUsbConnected())
  {
    logSerial.printf("@ no serial connected, failed sending: %s", message);

    return;
  }

  // write either as blocking or non-blocking
  if (blocking)
  {
    appSerial.writeBlock((uint8_t *)message, length);
  }
  else
  {
    appSerial.writeNB(EPBULK_IN, (uint8_t *)message, length, MAX_PACKET_SIZE_EPBULK);
  }

  // only log messages that are not a single character (high speed data)
  if (length > 2 && message[1] != ':')
  {
    logSerial.printf("> %s", message);
  }

  // reset the app message sent timer if at least twice the blink duration has passed
  if (appMessageSentTimer.read_ms() >= APP_MESSAGE_SENT_BLINK_DURATION_MS * 2)
  {
    appMessageSentTimer.reset();
  }
}

// sends given printf-formatted message to app serial if connected
void send(const char *fmt, ...)
{
  // create formatted message
  char buf[MAX_PACKET_SIZE_EPBULK];
  va_list args;
  va_start(args, fmt);
  int resultLength = vsnprintf(buf, MAX_PACKET_SIZE_EPBULK, fmt, args);
  va_end(args);

  // write as non-blocking
  sendRaw(buf, resultLength, true);
}

// sends given printf-formatted message to app serial if connected
void sendAsync(const char *fmt, ...)
{
  // create formatted message
  char buf[MAX_PACKET_SIZE_EPBULK];
  va_list args;
  va_start(args, fmt);
  int resultLength = vsnprintf(buf, MAX_PACKET_SIZE_EPBULK, fmt, args);
  va_end(args);

  // write as non-blocking
  sendRaw(buf, resultLength, false);
}

// reports encoder values
void reportEncoderValues(bool force = false)
{
  // variables to store status and validity
  uint8_t statusM1, statusM2;
  bool validM1, validM2;

  // read encoder values
  // TODO: could we do this asynchronously? takes 1-2ms
  int encoderDeltaM1 = (int)motors.getEncoderDeltaM1(&statusM1, &validM1);
  int encoderDeltaM2 = (int)motors.getEncoderDeltaM2(&statusM2, &validM2);

  // make sure we got valid results
  if (!validM1 || !validM2)
  {
    logSerial.printf("@ reading motor encoders failed, is the power supply to the motor controller missing?\n");

    return;
  }

  // don't bother sending the update if the speeds have not changed
  if (!force && abs(encoderDeltaM1 - lastEncoderDeltaM1) == 0 && abs(encoderDeltaM2 - lastEncoderDeltaM2) == 0)
  {
    return;
  }

  // keep track of last values
  lastEncoderDeltaM1 = encoderDeltaM1;
  lastEncoderDeltaM2 = encoderDeltaM2;

  // send the encoder values
  send("e:%d:%d\n", encoderDeltaM1, encoderDeltaM2);
}

// reports given button state
void reportButtonState(string name, int state)
{
  send("button:%s:%d\n", name.c_str(), state);
}

void reportButtonStates()
{
  reportButtonState("start", startButton.read());
  reportButtonState("left", leftBumper.read());
  reportButtonState("right", rightBumper.read());
}

void reportTargetSpeed()
{
  send("s:%d:%d\n", targetSpeedM1, targetSpeedM2);
}

void reportLidarState()
{
  send("lidar:%d:%d:%.1f:%.1f:%.2f\n", lidar.isStarted() ? 1 : 0, lidar.isValid() ? 1 : 0, lidar.getTargetRpm(), lidar.getCurrentRpm(), lidar.getMotorPwm());
}

void reportVoltage()
{
  // apparently the reported value is slightly off
  bool isValid;
  float voltage = motors.getMainBatteryVoltage(&isValid) * MAIN_VOLTAGE_CORRECTION_MULTIPLIER;

  send("voltage:%.1f:%d\n", voltage, isValid ? 1 : 0);
}

void reportCurrent()
{
  CurrentMeasurement currents = motors.getCurrents();

  send("current:%.2f:%.2f:%d\n", currents.currentM1, currents.currentM2, currents.isValid ? 1 : 0);
}

// reports all current internal states
void reportState()
{
  reportButtonStates();
  reportTargetSpeed();
  reportLidarState();
  reportVoltage();
  reportCurrent();
  reportEncoderValues(true);
}

// sets given strip led color
void setLedColor(int index, unsigned char red, unsigned char green, unsigned char blue, unsigned char brightness = 255)
{
  rearLedStrip.SetI(index, brightness);
  rearLedStrip.SetR(index, red);
  rearLedStrip.SetG(index, green);
  rearLedStrip.SetB(index, blue);

  rearLedNeedsUpdate = true;
}

// returns random integer in given range (including)
int getRandomInRange(int min, int max)
{
  return min + rand() / (RAND_MAX / (max - min + 1) + 1);
}

// handles speed:A:B command where A and B are the target speeds for motor 1 and 2
void handleSpeedCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();

  // make sure we got the right number of parameters
  if (argumentCount != 2)
  {
    send("@ speed:A:B expects exactly two parameters (where A is motor 1 speed and B is motor 2 speed)\n");

    // update target speed states
    targetSpeedM1 = 0;
    targetSpeedM2 = 0;
  }
  else
  {
    // get target motor speeds
    targetSpeedM1 = commander->getIntArgument(0);
    targetSpeedM2 = commander->getIntArgument(1);
  }

  // set motor speeds
  motors.setSpeedM1(targetSpeedM1);
  motors.setSpeedM2(targetSpeedM2);

  // report new target speeds
  reportTargetSpeed();
}

// handles rpm:RPM command, starts or stops the lidar setting target RPM
void handleRpmCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();

  // make sure we got the right number of parameters
  if (argumentCount != 1)
  {
    send("@ rpm:RPM expects exactly one parameter (where RPM is the new target lidar rpm)\n");

    // stop the lidar when receiving invalid command
    lidar.setTargetRpm(0);

    return;
  }

  int targetRpm = commander->getIntArgument(0);

  lidar.setTargetRpm(targetRpm);

  // report new target rpm
  send("rpm:%d\n", targetRpm);
}

// handles lidar command, sends back lidar RPM, whether lidar is running and valid, queued command count
void handleLidarCommand(Commander *commander)
{
  reportLidarState();
}

// handles voltage command, responds with main battery voltage
void handleVoltageCommand(Commander *commander)
{
  reportVoltage();
}

// handles current command, responds with current draws of both motors
void handleCurrentCommand(Commander *commander)
{
  reportCurrent();
}

// handles proxy:xxx:yyy etc command where xxx:yyy gets handled by the other commander
void handleProxyCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();

  std::string command = "";

  // reassemble the command
  for (unsigned int i = 0; i < argumentCount; i++)
  {
    if (i > 0)
    {
      command += ":";
    }

    command += commander->getStringArgument(i);
  }

  // resolve the other commander
  Commander *otherCommander = commander == &logCommander ? &appCommander : &logCommander;

  // log forward attempt
  send("# proxying \"%s\" to %s commander\n", command.c_str(), commander == &logCommander ? "robot" : "pc");

  // forward the command to the other serial
  otherCommander->handleCommand(command);
}

// handles ping command, responds with pong
void handlePingCommand(Commander *commander)
{
  send("pong\n");
}

// handles state request command, responds with all internal states
void handleStateCommand(Commander *commander)
{
  reportState();
}

void setupUsbPowerSensing()
{
  usbPowerSense.mode(PullDown);
}

void setupStatusLeds()
{
  // set initial status led states
  loopStatusLed = 0;
  usbStatusLed = 0;
}

void setupButtons()
{
  // read initial button states
  lastStartButtonState = startButton.read();
  lastLeftBumperState = leftBumper.read();
  lastRightBumperState = rightBumper.read();
}

void setupCommandHandlers()
{
  // TODO: implement helper that adds both?
  // registerCommandHandler("speed", handleSpeedCommand);

  // sets target motor speeds (alias as just "s" for less bandwidth)
  logCommander.registerCommandHandler("s", callback(handleSpeedCommand, &logCommander));
  appCommander.registerCommandHandler("s", callback(handleSpeedCommand, &appCommander));

  // sets target lidar rpm
  logCommander.registerCommandHandler("rpm", callback(handleRpmCommand, &logCommander));
  appCommander.registerCommandHandler("rpm", callback(handleRpmCommand, &appCommander));

  // reports lidar state
  logCommander.registerCommandHandler("lidar", callback(handleLidarCommand, &logCommander));
  appCommander.registerCommandHandler("lidar", callback(handleLidarCommand, &appCommander));

  // reports battery voltage
  logCommander.registerCommandHandler("voltage", callback(handleVoltageCommand, &logCommander));
  appCommander.registerCommandHandler("voltage", callback(handleVoltageCommand, &appCommander));

  // reports motor currents
  logCommander.registerCommandHandler("current", callback(handleCurrentCommand, &logCommander));
  appCommander.registerCommandHandler("current", callback(handleCurrentCommand, &appCommander));

  // proxy forwards the command to the other commander, useful for remote control etc
  logCommander.registerCommandHandler("proxy", callback(handleProxyCommand, &logCommander));
  appCommander.registerCommandHandler("proxy", callback(handleProxyCommand, &appCommander));

  // proxy forwards the command to the other commander, useful for remote control etc
  logCommander.registerCommandHandler("ping", callback(handlePingCommand, &logCommander));
  appCommander.registerCommandHandler("ping", callback(handlePingCommand, &appCommander));

  // reports all internal state information
  logCommander.registerCommandHandler("state", callback(handleStateCommand, &logCommander));
  appCommander.registerCommandHandler("state", callback(handleStateCommand, &appCommander));

  // TODO: implement help handler
}

void setupMotors()
{
  motors.setSpeedM1(0);
  motors.setSpeedM2(0);
  motors.resetEncoders();
}

void setupRearLedStrip()
{
  rearLedController.useII(WS2812::PER_PIXEL); // use per-pixel intensity scaling

  for (int i = 0; i < REAR_LED_COUNT; i++)
  {
    setLedColor(i, 0, 255, 0, 255);
  }
}

void stepUsbConnectionState()
{
  // get usb connection state (also checks for usb power as the USBSerial fails to detect disconnect)
  bool isConnected = isUsbConnected();

  // light up status led 2 when the usb is connected
  if (isConnected != wasUsbConnected)
  {
    // notify usb connection state change
    logSerial.printf("# usb %s\n", isConnected ? "connected" : "disconnected");

    // notify app of reset
    if (isConnected)
    {
      // notify of reset
      send("reset\n");
    }

    wasUsbConnected = isConnected;
  }

  if (isConnected && appMessageSentTimer.read_ms() < APP_MESSAGE_SENT_BLINK_DURATION_MS)
  {
    // turn the usb status led off for a brief duration when transmitting data
    usbStatusLed = 0;
  }
  else
  {
    // turn the usb status led on when connected
    usbStatusLed = isConnected ? 1 : 0;
  }
}

void stepButton(DebouncedInterruptIn *button, string name, int *lastState)
{
  // get current state
  int currentState = button->read();

  // check whether the state has changed
  if (currentState != *lastState)
  {
    // report button state change if different
    reportButtonState(name, currentState);

    // update last reported state
    *lastState = currentState;
  }
}

void stepStartButton()
{
  stepButton(&startButton, "start", &lastStartButtonState);
}

void stepLeftBumper()
{
  stepButton(&leftBumper, "left", &lastLeftBumperState);
}

void stepRightBumper()
{
  stepButton(&rightBumper, "right", &lastRightBumperState);
}

void stepCommanders()
{
  logCommander.handleAllQueuedCommands();
  appCommander.handleAllQueuedCommands();
}

void stepEncoderReporter()
{
  // report encoder values at certain interval
  if (reportEncoderValuesTimer.read_ms() >= REPORT_ENCODER_VALUES_INTERVAL_MS)
  {
    reportEncoderValues();

    reportEncoderValuesTimer.reset();
  }
}

void stepLidarMeasurements()
{
  int queuedMeasurementCount = lidar.getQueuedMeasurementCount();

  // skip if nothing to send
  if (queuedMeasurementCount == 0)
  {
    return;
  }

  // skip and remove queued measurements if app serial is not connected
  if (!appSerial.connected())
  {
    // TODO: add method to lidar to clear all queued measurements
    while (lidar.getQueuedMeasurementCount() > 0)
    {
      LidarMeasurement *measurement = lidar.popQueuedMeasurement();

      delete measurement;
    }

    return;
  }

  // output the queued lidar measurements
  while (lidar.getQueuedMeasurementCount() > 0)
  {
    // pop next measurement
    LidarMeasurement *measurement = lidar.popQueuedMeasurement();

    // only send valid and strong measurements
    if (measurement->isValid && measurement->isStrong)
    {
      sendAsync("m:%d:%d:%d\n", measurement->angle, measurement->distance / 10, measurement->quality);
    }

    // make sure to delete it afterwards
    delete measurement;
  }
}

void stepRearLedStrip()
{
  // test leds by setting new random colors at certain interval
  if (rearLedUpdateTimer.read_ms() >= 500)
  {
    for (int i = 0; i < REAR_LED_COUNT; i++)
    {
      setLedColor(i, getRandomInRange(0, 255), getRandomInRange(0, 255), getRandomInRange(0, 255), 255);
    }

    rearLedUpdateTimer.reset();
  }

  if (!rearLedNeedsUpdate)
  {
    return;
  }

  // write the update rear led buffer
  rearLedController.write(rearLedStrip.getBuf());

  rearLedNeedsUpdate = false;
}

void stepLoopBlinker()
{
  int timeSinceLastBlink = loopLedTimer.read_ms();
  bool shouldReset = timeSinceLastBlink > LOOP_LED_INTERVAL_MS + LOOP_LED_BLINK_DURATION_MS;
  int currentLoopLedState = !shouldReset && timeSinceLastBlink > LOOP_LED_INTERVAL_MS ? 1 : 0;

  // check whether loop led state has changed
  if (currentLoopLedState != lastLoopLedState)
  {
    // set new loop led state and update last state
    loopStatusLed = currentLoopLedState;
    lastLoopLedState = currentLoopLedState;

    // send connection alive beacon message on rising edge
    if (currentLoopLedState == 1 && isUsbConnected())
    {
      send("b:%d:%d\n", timeSinceLastBlink, cycleCountSinceLastLoopBlink);
    }
  }

  // reset loop led timer if interval + blink duration has passed
  if (shouldReset)
  {
    loopLedTimer.reset();
    cycleCountSinceLastLoopBlink = 0;
  }
  else
  {
    cycleCountSinceLastLoopBlink++;
  }
}

void stepLoopTimer()
{
  // read the loop time in microseconds and reset the timer
  lastLoopTimeUs = loopTimer.read_us();
  loopTimer.reset();
}

void setupTimers()
{
  // start timers
  reportEncoderValuesTimer.start();
  loopTimer.start();
  loopLedTimer.start();
  rearLedUpdateTimer.start();
  appMessageSentTimer.start();
  debugTimer.start();
}

const int SLOW_OPERATION_THRESHOLD_US = 1000; // 1ms

void s()
{
  debugTimer.reset();
}

void d(const char *name, int slowThreshold = SLOW_OPERATION_THRESHOLD_US)
{
  int elapsedUs = debugTimer.read_us();

  if (elapsedUs >= slowThreshold)
  {
    logSerial.printf("@ %s took %d us\n", name, elapsedUs);
  }
}

int main()
{
  logSerial.printf("# initializing.. ");

  // setup resources
  setupUsbPowerSensing();
  setupStatusLeds();
  setupButtons();
  setupCommandHandlers();
  setupMotors();
  setupRearLedStrip();
  setupTimers();

  logSerial.printf("done!\n");

  // run main loop
  while (true)
  {
    s();
    stepUsbConnectionState();
    d("stepUsbConnectionState");

    s();
    stepStartButton();
    d("stepStartButton");

    s();
    stepLeftBumper();
    d("stepLeftBumper");

    s();
    stepRightBumper();
    d("stepLeftBumper");

    s();
    stepCommanders();
    d("stepCommanders");

    s();
    stepEncoderReporter();
    d("stepEncoderReporter");

    s();
    stepLidarMeasurements();
    d("stepLidarMeasurements");

    s();
    stepRearLedStrip();
    d("stepRearLedStrip");

    s();
    stepLoopBlinker();
    d("stepLoopBlinker");

    s();
    stepLoopTimer();
    d("stepLoopTimer");
  }
}
