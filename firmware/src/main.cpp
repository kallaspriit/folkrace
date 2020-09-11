#include <mbed.h>
#include <USBSerial.h>

#include <Commander.hpp>
#include <RoboClaw.hpp>
#include <Lidar.hpp>
#include <DebouncedInterruptIn.hpp>
#include <WS2812.h>
#include <PixelArray.h>
#include <LSM9DS1.h>
#include <MadgwickAHRS.h>

// pin mapping configuration
const PinName LOG_SERIAL_TX_PIN = USBTX;
const PinName LOG_SERIAL_RX_PIN = USBRX;
const PinName IMU_SDA_PIN = p9;
const PinName IMU_SCL_PIN = p10;
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
const int LOG_SERIAL_BAUDRATE = 115200;   // log serial is the built-in usb of the mbed board
const int MOTOR_SERIAL_BAUDRATE = 460800; // not default, make sure to update in the Ion Studio

// timing configuration
const int LOOP_LED_BLINK_INTERVAL_MS = 1000;
const int LED_BLINK_DURATION_MS = 10;
const int BUTTON_DEBOUNCE_US = 100000; // 100ms

const int REPORT_STATUS_INTERVAL_MS = 1000;

// motor controller configuration
const uint8_t MOTORS_ADDRESS = 128;
const int MOTORS_TIMEOUT_US = 10000;

// voltage measurement correction configuration
const double MAIN_VOLTAGE_CORRECTION_MULTIPLIER = 1.02;

// usb serial configuration (same as USBSerial defaults)
// const uint16_t USB_VENDOR_ID = 0x1f00;
// const uint16_t USB_PRODUCT_ID = 0x2012;
// const uint16_t USB_PRODUCT_RELEASE = 0x0001;

// rear led configuration
const int REAR_LED_COUNT = 8;

// WS2812 led driver timing NOP counts for timing
const int WS2812_ZERO_HIGH_LENGTH = 0;
const int WS2812_ZERO_LOW_LENGTH = 5;
const int WS2812_ONE_HIGH_LENGTH = 5;
const int WS2812_ONE_LOW_LENGTH = 0;

// lidar configuration
const float LIDAR_PID_P = 3.0f;
const float LIDAR_PID_I = 1.5f;
const float LIDAR_PID_D = 0.0f;
const float LIDAR_STARTUP_PWM = 0.35f;                                    // startup pwm, should be close to real at target rpm
const float LIDAR_TARGET_RPM = 300.0f;                                    // 5Hz
const float LIDAR_PID_INTERVAL_MS = 1000.0f / (LIDAR_TARGET_RPM / 60.0f); // 200ms at 300rpm (5Hz)
const int LIDAR_REPORT_STATE_INTERVAL_MS = 1000;                          // how often to report the lidar state

// IMU configuration
const int IMU_ACCELEROMETER_GYRO_ADDRESS = 0xD6;
const int IMU_MAGNETOMETER_ADDRESS = 0x3C;

// AHRS configuration
const float AHRS_GYRO_ERROR_DEG_S = 1.0f;
const int AHRS_INITIAL_SAMPLE_FREQUENCY = 100;

// conversion factors
const int US_IN_SECONDS = 1000000;

// main loop configuration
const int TARGET_LOOP_UPDATE_RATE = 100; // hz
const int TARGET_LOOP_DURATION_US = US_IN_SECONDS / TARGET_LOOP_UPDATE_RATE;
const int LOOP_SLEEP_OVERHEAD_US = 10;

// list of possible error states (error led blinks error position number of times)
enum Error
{
  IMU_NOT_AVAILABLE
};

// setup serials
BufferedSerial logSerial(LOG_SERIAL_TX_PIN, LOG_SERIAL_RX_PIN, LOG_SERIAL_BAUDRATE);
BufferedSerial motorsSerial(MOTOR_SERIAL_TX_PIN, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_BAUDRATE);
USBSerial appSerial(false /*, USB_VENDOR_ID, USB_PRODUCT_ID, USB_PRODUCT_RELEASE*/);

// setup commanders (handle serial commands)
Commander logCommander(&logSerial);
Commander appCommander(&appSerial);

// setup motor controller
RoboClaw motors(&motorsSerial, MOTORS_TIMEOUT_US);

// setup lidar
Lidar lidar(LIDAR_TX_PIN, LIDAR_RX_PIN, LIDAR_PWM_PIN, LIDAR_PID_P, LIDAR_PID_I, LIDAR_PID_D, LIDAR_PID_INTERVAL_MS, LIDAR_STARTUP_PWM);

// setup IMU and AHRS
LSM9DS1 imu(IMU_SDA_PIN, IMU_SCL_PIN, IMU_ACCELEROMETER_GYRO_ADDRESS, IMU_MAGNETOMETER_ADDRESS);
MadgwickAHRS ahrs(AHRS_GYRO_ERROR_DEG_S, AHRS_INITIAL_SAMPLE_FREQUENCY);

// setup timers
Timer loopTimer;
Timer loopLedTimer;
Timer rearLedUpdateTimer;
Timer appMessageSentTimer;
Timer debugTimer;
Timer reportLidarStateTimer;

// setup status leds
DigitalOut loopStatusLed(LED1);
DigitalOut usbStatusLed(LED2);
DigitalOut errorLed(LED3);

// setup usb power sense (usb serial knows when it gets connected but not when disconnected)
DigitalIn usbPowerSense(USB_POWER_SENSE_PIN);

// setup rear led strip
WS2812 rearLedController(REAR_LED_STRIP_DATA_PIN, REAR_LED_COUNT, WS2812_ZERO_HIGH_LENGTH, WS2812_ZERO_LOW_LENGTH, WS2812_ONE_HIGH_LENGTH, WS2812_ONE_LOW_LENGTH);
PixelArray rearLedStrip(REAR_LED_COUNT);

// setup buttons
DebouncedInterruptIn startButton(START_SWITCH_PIN, PullUp, BUTTON_DEBOUNCE_US);
DebouncedInterruptIn leftBumper(LEFT_BUMPER_PIN, PullUp, BUTTON_DEBOUNCE_US);
DebouncedInterruptIn rightBumper(RIGHT_BUMPER_PIN, PullUp, BUTTON_DEBOUNCE_US);

// buffer used to send printf formatted messages
const int SEND_BUFFER_SIZE = 64;
static char sendBuffer[SEND_BUFFER_SIZE];

// keep track of encoder values
uint32_t lastEncoderDeltaM1 = 0;
uint32_t lastEncoderDeltaM2 = 0;

// track button state changes (default to unknown)
int lastStartButtonState = -1;
int lastLeftBumperState = -1;
int lastRightBumperState = -1;

// track whether the rear led strip requires update
bool rearLedNeedsUpdate = true;

// track usb connection state
bool wasUsbConnected = false;

// track whether talking to the motors board is working
bool wasMotorsCommunicationWorking = true;

// track target speeds
int targetSpeedM1 = 0;
int targetSpeedM2 = 0;

// keep track of last loop time in microseconds
int lastLoopTimeUs = 0;

// main thread load in percentage
int loadPercentage = 100;

// keep track of last loop led state and cycle count
int lastLoopLedState = 0;
int cycleCountSinceLastLoopBlink = 0;

// keep track of the number of read and sent lidar measurements
int readLidarMeasurementCount = 0;

// enters infinite loop, blinking given error sequence on the error led
void dieWithError(Error error, const char *message)
{
  printf("@ %s\n", message);

  // blink error index + 1 number of times
  int blinkCount = (int)error + 1;

  errorLed = 0;

  // enter infinite loop
  while (true)
  {
    // blink fast according to error
    for (int i = 0; i < blinkCount; i++)
    {
      ThisThread::sleep_for(100ms);

      errorLed = 1;

      ThisThread::sleep_for(100ms);

      errorLed = 0;
    }

    // turn error led off for a while
    ThisThread::sleep_for(3s);
  }
}

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
void sendRaw(const char *message, int length)
{
  // don't attempt to send if not connected as writing is blocking
  if (!isUsbConnected())
  {
    printf("@ %s", message);

    return;
  }

  // make sure app serial is writable
  if (!appSerial.writable())
  {
    printf("@ app serial not writable to send %s", message);

    return;
  }

  // write either as blocking or non-blocking
  // appSerial.write((uint8_t *)message, length);
  appSerial.send((uint8_t *)message, length);

  // uint32_t sentLength;
  // appSerial.send_nb((uint8_t *)message, length, &sentLength);

  // if ((int)sentLength != length)
  // {
  //   printf("@ sent length %d does not match message length %d, attempted to send %s", (int)sentLength, length, message);
  // }
  // else if (length > 2 && message[1] != ':')
  // {
  //   // only log messages that are not a single character (high speed data)
  //   printf("> %s", message);
  // }

  if (length > 2 && message[1] != ':')
  {
    // only log messages that are not a single character (high speed data)
    printf("> %s", message);
  }

  // reset the app message sent timer if at least twice the blink duration has passed
  // TODO: use Timeout instead?
  if (std::chrono::duration_cast<std::chrono::milliseconds>(appMessageSentTimer.elapsed_time()).count() >= LED_BLINK_DURATION_MS * 2)
  {
    appMessageSentTimer.reset();
  }
}

// sends given printf-formatted message to app serial if connected
void send(const char *fmt, ...)
{
  // create formatted message
  va_list args;
  va_start(args, fmt);
  int length = vsnprintf(sendBuffer, SEND_BUFFER_SIZE, fmt, args);
  va_end(args);

  // send
  sendRaw(sendBuffer, length);
}

void reportMotorsCommunicationState()
{
  send("motors:%d\n", wasMotorsCommunicationWorking);
}

void handleMotorsCommunicationResult(bool isSuccessful)
{
  // skip if communication state has not changed
  if (isSuccessful == wasMotorsCommunicationWorking)
  {
    return;
  }

  wasMotorsCommunicationWorking = isSuccessful;

  reportMotorsCommunicationState();
}

// sends new target motor speeds
bool setMotorSpeeds(int targetSpeedM1, int targetSpeedM2)
{
  // set motor speeds
  bool sendSuccess = motors.speedM1M2(MOTORS_ADDRESS, targetSpeedM1, targetSpeedM2);

  handleMotorsCommunicationResult(sendSuccess);

  return sendSuccess;
}

// reports encoder values
void reportEncoderValues(bool force = false)
{
  uint32_t encoderDeltaM1, encoderDeltaM2;

  bool readSuccess = motors.readEncoders(MOTORS_ADDRESS, encoderDeltaM1, encoderDeltaM2);

  handleMotorsCommunicationResult(readSuccess);

  // make sure we got valid results
  if (!readSuccess)
  {
    return;
  }

  // don't bother sending the update if the speeds have not changed
  if (!force && labs(encoderDeltaM1 - lastEncoderDeltaM1) == 0 && labs(encoderDeltaM2 - lastEncoderDeltaM2) == 0)
  {
    return;
  }

  // keep track of last values
  lastEncoderDeltaM1 = encoderDeltaM1;
  lastEncoderDeltaM2 = encoderDeltaM2;

  // send the encoder values (convert to int to get negative values)
  send("e:%d:%d\n", (int)encoderDeltaM1, (int)encoderDeltaM2);
}

// reports given button state
void reportButtonState(string name, int state)
{
  // send flipped button state (normally low when pressed)
  send("button:%s:%d\n", name.c_str(), !state);
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
  // TODO: add invalid, weak, out of order, rotation count
  send("lidar:%d:%d:%.1f:%.1f:%.2f\n", lidar.isRunning() ? 1 : 0, lidar.isValid() ? 1 : 0, lidar.getTargetRpm(), lidar.getCurrentRpm(), lidar.getMotorPwm());
}

void reportBatteryVoltage()
{
  // apparently the reported value is slightly off
  bool readSuccess;

  uint16_t voltage = motors.readMainBatteryVoltage(MOTORS_ADDRESS, &readSuccess) * MAIN_VOLTAGE_CORRECTION_MULTIPLIER;

  handleMotorsCommunicationResult(readSuccess);

  if (!readSuccess)
  {
    return;
  }

  send("voltage:%d\n", (int)voltage);
}

void reportCurrent()
{
  int16_t currentM1, currentM2;

  bool readSuccess = motors.readCurrents(MOTORS_ADDRESS, currentM1, currentM2);

  handleMotorsCommunicationResult(readSuccess);

  if (!readSuccess)
  {
    return;
  }

  send("current:%d:%d\n", (int)currentM1, (int)currentM2);
}

// reports all current internal states
void reportState()
{
  reportButtonStates();
  reportTargetSpeed();
  reportLidarState();
  reportBatteryVoltage();
  reportCurrent();
  reportEncoderValues(true);
  reportMotorsCommunicationState();
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
  setMotorSpeeds(targetSpeedM1, targetSpeedM2);

  // TODO: does this need reporting as the speed came from other side?
  // report new target speeds
  // reportTargetSpeed();
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
    lidar.stop();

    return;
  }

  int targetRpm = commander->getIntArgument(0);

  lidar.setTargetRpm(targetRpm);

  // report new target rpm
  send("rpm:%d\n", targetRpm);

  reportLidarState();
}

// handles lidar command, sends back lidar RPM, whether lidar is running and valid, queued command count
void handleLidarCommand(Commander *commander)
{
  reportLidarState();
}

// handles voltage command, responds with main battery voltage
void handleVoltageCommand(Commander *commander)
{
  reportBatteryVoltage();
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

void setupUsbSerial()
{
  appSerial.connect();
}

void setupStatusLeds()
{
  // set initial status led states
  loopStatusLed = 0;
  usbStatusLed = 0;
  errorLed = 0;
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
  // stop motors
  setMotorSpeeds(0, 0);

  // reset encoder values
  bool writeSuccess = motors.resetEncoders(MOTORS_ADDRESS);

  handleMotorsCommunicationResult(writeSuccess);
}

void setupRearLedStrip()
{
  rearLedController.useII(WS2812::PER_PIXEL); // use per-pixel intensity scaling

  for (int i = 0; i < REAR_LED_COUNT; i++)
  {
    setLedColor(i, 0, 255, 0, 255);
  }
}

void setupIMU()
{
  // attempt to initialize
  if (!imu.begin())
  {
    // no IMU is available, blink the error led
    dieWithError(Error::IMU_NOT_AVAILABLE, "communicating with LSM9DS1 IMU failed");
  }

  printf("# calibrating IMU.. ");

  imu.calibrate();

  printf("done!\n");
}

void stepCommanders()
{
  // update serials (reads input and handles commands)
  logCommander.update();
  appCommander.update();
}

void stepUsbConnectionState()
{
  // get usb connection state (also checks for usb power as the USBSerial fails to detect disconnect)
  bool isConnected = isUsbConnected();

  // light up status led 2 when the usb is connected
  if (isConnected != wasUsbConnected)
  {
    // notify usb connection state change
    printf("# usb %s\n", isConnected ? "connected" : "disconnected");

    // notify app of reset
    if (isConnected)
    {
      // notify of reset
      send("reset\n");
    }

    wasUsbConnected = isConnected;
  }

  if (isConnected && std::chrono::duration_cast<std::chrono::milliseconds>(appMessageSentTimer.elapsed_time()).count() < LED_BLINK_DURATION_MS)
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

void stepEncoderReporter()
{
  reportEncoderValues();
}

void stepLidar()
{
  lidar.update();

  bool isConnected = isUsbConnected();

  // report lidar state at an interval
  if (isConnected && lidar.isRunning() && std::chrono::duration_cast<std::chrono::milliseconds>(reportLidarStateTimer.elapsed_time()).count() >= LIDAR_REPORT_STATE_INTERVAL_MS)
  {
    reportLidarState();

    reportLidarStateTimer.reset();
  }

  // skip measurements if lidar is not running or usb is not connected
  if (!isConnected || !lidar.isRunning())
  {
    readLidarMeasurementCount = lidar.getTotalMeasurementCount();

    return;
  }

  // loop through unseen lidar measurements
  do
  {
    // get number of queued measurements
    int queuedMeasurementCount = lidar.getTotalMeasurementCount() - readLidarMeasurementCount;

    // break if we have no new set of 4 new measurements available
    if (queuedMeasurementCount < 4)
    {
      break;
    }

    // get the measurements
    Lidar::Measurement *measurement1 = lidar.getMeasurement(readLidarMeasurementCount++);
    Lidar::Measurement *measurement2 = lidar.getMeasurement(readLidarMeasurementCount++);
    Lidar::Measurement *measurement3 = lidar.getMeasurement(readLidarMeasurementCount++);
    Lidar::Measurement *measurement4 = lidar.getMeasurement(readLidarMeasurementCount++);

    // send the measurements
    send("l:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d\n", measurement1->angle, measurement1->distance, measurement1->quality, measurement2->angle, measurement2->distance, measurement2->quality, measurement3->angle, measurement3->distance, measurement3->quality, measurement4->angle, measurement4->distance, measurement4->quality);
  } while (true);
}

void stepIMU()
{
  // read IMU values
  imu.readMag();
  imu.readGyro();
  imu.readAccel();

  // convert raw gyro readings to deg/s
  float gx = imu.calcGyro(imu.gx);
  float gy = imu.calcGyro(imu.gy);
  float gz = imu.calcGyro(imu.gz);

  // convert raw accelerometer readings to g's
  float ax = imu.calcAccel(imu.ax);
  float ay = imu.calcAccel(imu.ay);
  float az = imu.calcAccel(imu.az);

  // convert raw magnetometer readings to G's
  float mx = imu.calcMag(imu.mx);
  float my = imu.calcMag(imu.my);
  float mz = imu.calcMag(imu.mz);

  // update ahrs
  ahrs.update(gx, gy, gz, ax, ay, az, mx, my, mz);

  // get robot attitude
  float roll = ahrs.getRoll();
  float pitch = ahrs.getPitch();
  float yaw = ahrs.getYaw();

  // report the readings and attitude information
  if (isUsbConnected())
  {
    // TODO: send attitude quaternion instead of roll-pitch-yaw
    // sendAsync("i:%f:%f:%f:%f:%f:%f:%f:%f:%f:%f:%f:%f\n", gx, gy, gz, ax, ay, az, mx, my, mz, roll, pitch, yaw);
    send("a:%f:%f:%f\n", roll, pitch, yaw);
  }
}

void stepRearLedStrip()
{
  // test leds by setting new random colors at certain interval
  if (rearLedUpdateTimer.elapsed_time() >= 500ms)
  {
    rearLedUpdateTimer.reset();

    for (int i = 0; i < REAR_LED_COUNT; i++)
    {
      setLedColor(i, getRandomInRange(0, 255), getRandomInRange(0, 255), getRandomInRange(0, 255), 255);
    }
  }

  if (!rearLedNeedsUpdate)
  {
    return;
  }

  // update real led strip state
  rearLedController.write(rearLedStrip.getBuf());

  rearLedNeedsUpdate = false;
}

void stepLoopBlinker()
{
  int timeSinceLastBlinkMs = std::chrono::duration_cast<std::chrono::milliseconds>(loopLedTimer.elapsed_time()).count();
  bool shouldReset = timeSinceLastBlinkMs > LOOP_LED_BLINK_INTERVAL_MS + LED_BLINK_DURATION_MS;
  int currentLoopLedState = !shouldReset && timeSinceLastBlinkMs > LOOP_LED_BLINK_INTERVAL_MS ? 1 : 0;

  cycleCountSinceLastLoopBlink++;

  // check whether loop led state has changed
  if (currentLoopLedState != lastLoopLedState)
  {
    // set new loop led state and update last state
    loopStatusLed = currentLoopLedState;
    lastLoopLedState = currentLoopLedState;

    // send connection alive beacon message on rising edge
    if (currentLoopLedState == 1 && isUsbConnected())
    {
      // sendAsync("b:%d:%d\n", timeSinceLastBlinkMs, cycleCountSinceLastLoopBlink);
      send("b:%d:%d:%d\n", timeSinceLastBlinkMs, cycleCountSinceLastLoopBlink, loadPercentage);
    }

    // calculate main loop execution frequency (should be the same as cycleCountSinceLastLoopBlink)
    int loopFrequency = ceil(((float)cycleCountSinceLastLoopBlink / (float)timeSinceLastBlinkMs) * 1000.0f);

    // printf("# fps: %d\n", loopFrequency);

    // update ahrs sample frequency (matches loop execution frequency)
    ahrs.setSampleFrequency(loopFrequency);

    // log IMU attitude
    // printf("# frequency: %d, roll: %f, pitch: %f, yaw: %f\n", loopFrequency, ahrs.getRoll(), ahrs.getPitch(), ahrs.getYaw());
  }

  // reset loop led timer if interval + blink duration has passed
  if (shouldReset)
  {
    loopLedTimer.reset();
    cycleCountSinceLastLoopBlink = 0;
  }
}

void setupTimers()
{
  // start timers
  loopLedTimer.start();
  rearLedUpdateTimer.start();
  appMessageSentTimer.start();
  debugTimer.start();
  reportLidarStateTimer.start();
  loopTimer.start();
}

const int SLOW_OPERATION_THRESHOLD_US = 1000; // 1ms

void s()
{
  debugTimer.reset();
}

void d(const char *name, int slowThreshold = SLOW_OPERATION_THRESHOLD_US)
{
  int elapsedUs = debugTimer.elapsed_time().count();

  if (elapsedUs >= slowThreshold)
  {
    printf("@ %s took %d us\n", name, elapsedUs);
  }
}

int main()
{
  // setup resources
  setupUsbSerial();
  setupUsbPowerSensing();
  setupStatusLeds();
  setupButtons();
  setupCommandHandlers();
  setupMotors();
  setupRearLedStrip();
  // setupIMU();
  setupTimers();

  printf("# initialization complete!\n");

  // run main loop
  while (true)
  {
    // read the loop time and reset the timer
    lastLoopTimeUs = loopTimer.elapsed_time().count();
    loopTimer.reset();

    s();
    stepCommanders();
    d("stepCommanders", 3000);

    s();
    stepUsbConnectionState();
    d("stepUsbConnectionState");

    s();
    stepStartButton();
    d("stepStartButton", 2000);

    s();
    stepLeftBumper();
    d("stepLeftBumper", 2000);

    s();
    stepRightBumper();
    d("stepRightBumper", 2000);

    s();
    stepLidar();
    d("stepLidar", 3000);

    // s();
    // stepIMU();
    // d("stepIMU", 4000);

    s();
    stepRearLedStrip();
    d("stepRearLedStrip");

    s();
    stepEncoderReporter();
    d("stepEncoderReporter", 3000);

    s();
    stepLoopBlinker();
    d("stepLoopBlinker");

    // get loop time taken in microseconds
    int loopTimeTakenUs = loopTimer.elapsed_time().count();

    loadPercentage = loopTimeTakenUs * 100 / TARGET_LOOP_DURATION_US;

    // wait to match target loop frequency
    if (loopTimeTakenUs + LOOP_SLEEP_OVERHEAD_US < TARGET_LOOP_DURATION_US)
    {
      wait_us(TARGET_LOOP_DURATION_US - loopTimeTakenUs - LOOP_SLEEP_OVERHEAD_US);
    }
  }
}
