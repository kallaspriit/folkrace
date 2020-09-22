#include <mbed.h>
#include <USBSerial.h>

#include <Commander.hpp>
#include <RoboClaw.hpp>
#include <Lidar.hpp>
#include <DebouncedInterruptIn.hpp>
#include <WS2812.hpp>
#include <PixelArray.hpp>
#include <LSM9DS1.hpp>
#include <MadgwickAHRS.hpp>
#include <LedAnimator.hpp>

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
const int HEARTBEAT_INTERVAL_MS = 1000;
const int LED_BLINK_DURATION_MS = 10;
const int REPORT_BATTERY_VOLTAGE_INTERVAL_MS = 1000;
const int REPORT_STATUS_INTERVAL_MS = 1000;
const int LIDAR_REPORT_STATE_INTERVAL_MS = 1000;

// motor controller configuration
const uint8_t MOTOR_CONTROLLER_ADDRESS = 128;
const int MOTOR_CONTROLLER_TIMEOUT_US = 10000;

// voltage measurement correction configuration
const double MAIN_VOLTAGE_CORRECTION_MULTIPLIER = 1.02;

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

// IMU configuration
const int IMU_ACCELEROMETER_GYRO_ADDRESS = 0xD6;
const int IMU_MAGNETOMETER_ADDRESS = 0x3C;

// conversion factors
const int US_IN_SECONDS = 1000000;

// main loop configuration
const int TARGET_LOOP_UPDATE_RATE = 60; // hz
const int TARGET_LOOP_DURATION_US = US_IN_SECONDS / TARGET_LOOP_UPDATE_RATE;
const int LOOP_SLEEP_OVERHEAD_US = 10;

// AHRS configuration
const float AHRS_GYRO_ERROR_DEG_S = 1.0f;
const int AHRS_INITIAL_SAMPLE_FREQUENCY = TARGET_LOOP_UPDATE_RATE;

// list of possible error states (error led blinks error position number of times)
enum Error
{
  ERROR_IMU_NOT_AVAILABLE,
  ERROR_PARTIAL_SEND,
  ERROR_DIE
};

// setup serials
BufferedSerial logSerial(LOG_SERIAL_TX_PIN, LOG_SERIAL_RX_PIN, LOG_SERIAL_BAUDRATE);
BufferedSerial motorsSerial(MOTOR_SERIAL_TX_PIN, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_BAUDRATE);
USBSerial appSerial(false /*, USB_VENDOR_ID, USB_PRODUCT_ID, USB_PRODUCT_RELEASE*/);

// setup commanders (handle serial commands)
Commander logCommander(&logSerial);
Commander appCommander(&appSerial);

// setup motor controller
RoboClaw motors(&motorsSerial, MOTOR_CONTROLLER_TIMEOUT_US);

// setup lidar
Lidar lidar(LIDAR_TX_PIN, LIDAR_RX_PIN, LIDAR_PWM_PIN, LIDAR_PID_P, LIDAR_PID_I, LIDAR_PID_D, LIDAR_PID_INTERVAL_MS, LIDAR_STARTUP_PWM);

// setup IMU and AHRS
LSM9DS1 imu(IMU_SDA_PIN, IMU_SCL_PIN, IMU_ACCELEROMETER_GYRO_ADDRESS, IMU_MAGNETOMETER_ADDRESS);
MadgwickAHRS ahrs(AHRS_GYRO_ERROR_DEG_S, AHRS_INITIAL_SAMPLE_FREQUENCY);

// setup timers
Timer loopTimer;
Timer reportHeartbeatTimer;
Timer updateRearLedTimer;
Timer performanceTimer;
Timer reportLidarStateTimer;
Timer reportBatteryVoltageTimer;
Timeout stopMotorsTimeout;

// setup status leds
DigitalOut loopStatusLed(LED1);
DigitalOut usbStatusLed(LED2);
DigitalOut errorLed(LED3);

// setup usb power sense (usb serial knows when it gets connected but not when disconnected)
DigitalIn usbPowerSense(USB_POWER_SENSE_PIN);

// setup rear led strip
WS2812 rearLedController(REAR_LED_STRIP_DATA_PIN, REAR_LED_COUNT, WS2812_ZERO_HIGH_LENGTH, WS2812_ZERO_LOW_LENGTH, WS2812_ONE_HIGH_LENGTH, WS2812_ONE_LOW_LENGTH);
PixelArray rearLedStrip(REAR_LED_COUNT);
LedAnimator ledAnimator(&rearLedStrip, REAR_LED_COUNT);

// setup buttons
DebouncedInterruptIn startButton(START_SWITCH_PIN);
DebouncedInterruptIn leftBumper(LEFT_BUMPER_PIN);
DebouncedInterruptIn rightBumper(RIGHT_BUMPER_PIN);

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

// last reported voltage (as tenths of actual voltage)
int lastReportedBatteryVoltage = -1;

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
int cycleCountSinceLastHeartbeat = 0;

// keep track of the number of read and sent lidar measurements
int readLidarMeasurementCount = 0;

// sets given strip led color
void setLedColor(int index, unsigned char red, unsigned char green, unsigned char blue, unsigned char brightness = 255)
{
  rearLedStrip.SetI(index, brightness);
  rearLedStrip.SetR(index, red);
  rearLedStrip.SetG(index, green);
  rearLedStrip.SetB(index, blue);

  rearLedNeedsUpdate = true;
}

// enters infinite loop, blinking given error sequence on the error led
void die(Error error, const char *fmt, ...)
{
  // create formatted message
  va_list args;
  va_start(args, fmt);
  vsnprintf(sendBuffer, SEND_BUFFER_SIZE, fmt, args);
  va_end(args);

  printf("@ [DIE ERROR %d] %s\n", (int)error, sendBuffer);

  // highlight rear led strip with error code
  for (int i = 0; i < REAR_LED_COUNT; i++)
  {
    // leds are indexed from right to left
    if (REAR_LED_COUNT - i - 1 == (int)error)
    {
      setLedColor(i, 255, 0, 0, 255);
    }
    else
    {
      setLedColor(i, 0, 255, 0, 255);
    }
  }

  rearLedController.write(rearLedStrip.getBuf());

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

  // initally try to send as non-blocking
  uint32_t sentLength;
  appSerial.send_nb((uint8_t *)message, length, &sentLength);

  if (sentLength == 0)
  {
    // sending non-blocking failed, try again using blocking call
    appSerial.send((uint8_t *)message, length);
  }
  else if ((int)sentLength != length)
  {
    // should not really happen?
    die(Error::ERROR_PARTIAL_SEND, "sent length %d does not match message length %d, attempted to send %s", (int)sentLength, length, message);
  }

  // only log messages that are not a single character (high speed data)
  if (length > 2 && message[1] != ':')
  {
    printf("> %s", message);
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
  bool sendSuccess = motors.speedM1M2(MOTOR_CONTROLLER_ADDRESS, targetSpeedM1, targetSpeedM2);

  handleMotorsCommunicationResult(sendSuccess);

  return sendSuccess;
}

int getBatteryVoltage()
{
  bool readSuccess;

  uint16_t voltage = motors.readMainBatteryVoltage(MOTOR_CONTROLLER_ADDRESS, &readSuccess) * MAIN_VOLTAGE_CORRECTION_MULTIPLIER;

  handleMotorsCommunicationResult(readSuccess);

  if (!readSuccess)
  {
    return -1;
  }

  return (int)voltage;
}

// reports encoder values
void reportEncoderValues(bool force = false)
{
  uint32_t encoderDeltaM1, encoderDeltaM2;

  bool readSuccess = motors.readEncoders(MOTOR_CONTROLLER_ADDRESS, encoderDeltaM1, encoderDeltaM2);

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
  send("b:%s:%d\n", name.c_str(), !state);
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
  send("l:%d:%d:%d:%d:%d\n", lidar.isRunning() ? 1 : 0, lidar.isValid() ? 1 : 0, (int)ceil(lidar.getTargetRpm() * 10.0f), (int)ceil(lidar.getCurrentRpm() * 10.0f), (int)ceil(lidar.getMotorPwm() * 100.0f));
}

void reportBatteryVoltage(bool force = false)
{
  int batteryVoltage = getBatteryVoltage();

  if (batteryVoltage == -1)
  {
    return;
  }

  // don't report same voltage as last time
  if (batteryVoltage == lastReportedBatteryVoltage && !force)
  {
    return;
  }

  // store last reported battery voltage
  lastReportedBatteryVoltage = batteryVoltage;

  send("v:%d\n", batteryVoltage);
}

// TODO: report automatically at some interval?
void reportCurrent()
{
  int16_t currentM1, currentM2;

  bool readSuccess = motors.readCurrents(MOTOR_CONTROLLER_ADDRESS, currentM1, currentM2);

  handleMotorsCommunicationResult(readSuccess);

  if (!readSuccess)
  {
    return;
  }

  send("c:%d:%d\n", (int)currentM1, (int)currentM2);
}

// reports all current internal states
void reportState()
{
  reportButtonStates();
  reportTargetSpeed();
  reportLidarState();
  reportCurrent();
  reportEncoderValues(true);
  reportBatteryVoltage(true);
  reportMotorsCommunicationState();
}

// returns random integer in given range (including)
int getRandomInRange(int min, int max)
{
  return min + rand() / (RAND_MAX / (max - min + 1) + 1);
}

// handles help command, responds with guide how to use the firmware functions
void handleHelpCommand(Commander *commander)
{
  printf("\n");
  printf("! Supported commands:\n");
  printf("! - s:SPEED_LEFT:SPEED_RIGHT   - sets left and right motor speeds (for example s:1000:-500)\n");
  printf("! - rpm:RPM                          - sets target lidar RPM (for example rpm:300)\n");
  printf("! - lidar                            - requests for lidar state\n");
  printf("! - voltage                          - requests for current main battery voltage\n");
  printf("! - current                          - requests for current motor currents\n");
  printf("! - state                            - requests for current state, reports various information\n");
  printf("! - proxy                            - forwards given message to other commander, useful for remote control etc\n");
  printf("! - ping                             - responds with 'pong', useful for measuring connection latency\n");
  printf("! - die                              - kills the board after stopping motors\n");
  printf("\n");
  printf("! Possible responses / messages:\n");
  printf("! - motors:IS_WORKING                - is connection to the motor controller working (1 if working, 0 for not working)\n");
  printf("! - pong                             - response to ping\n");
  printf("! - reset                            - usb connection state changed\n");
  printf("! - e:LEFT:RIGHT                     - motor encoders absolute position for left and right motors\n");
  printf("! - b:NAME:IS_PRESSED                - whether given button is pressed (1) or release (0)\n");
  printf("! - s:SPEED_LEFT:SPEED_RIGHT         - target speed for left and right motors\n");
  printf("! - s:SPEED_LEFT:SPEED_RIGHT         - target speed for left and right motors\n");
  printf("! - v:VOLTAGE                        - main battery voltage in tenths of volts (162 means 16.2V etc)\n");
  printf("! - c:CURRENT_LEFT:CURRENT_RIGHT     - motors currents in hundreths of amps (1253 means 12.53A etc)\n");
  printf("! - a:ROLL:PITCH_YAW                 - ahrs attitude in degrees\n");
  printf("! - h:LOOP_FREQUENCY:LOAD_PERCENTAGE - heartbeat with measured loop frequency and main thread load\n");
  printf("! - m:M1_A:M1_D:M1_Q:...             - lidar measurement angle, distance, quality (4 measurements at a time)\n");
  printf("! - l:IS_RUNNING:IS_VALID:TARGET_RPM:CURRENT_RPM:MOTOR_PWN - lidar state\n");
  printf("\n");
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
    lidar.stop();

    return;
  }

  int targetRpm = commander->getIntArgument(0);

  lidar.setTargetRpm(targetRpm);

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
  send("! proxying \"%s\" to %s commander\n", command.c_str(), commander == &logCommander ? "robot" : "pc");

  // forward the command to the other serial
  otherCommander->handleCommand(command);
}

// handles ping command, responds with pong
void handlePingCommand(Commander *commander)
{
  send("pong\n");
}

// handles die command, killing the process
void handleDieCommand(Commander *commander)
{
  // stop the motors
  setMotorSpeeds(0, 0);

  die(Error::ERROR_DIE, "die requested");
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

  Commander *commanders[] = {&logCommander, &appCommander};

  for (Commander *commander : commanders)
  {
    // handles request to kill the board
    commander->registerCommandHandler("help", callback(handleHelpCommand, commander));

    // sets left motor speed to A and right speed to B (for example s:1000:-500)
    commander->registerCommandHandler("s", callback(handleSpeedCommand, commander));

    // sets target lidar RPM to A rotations per minute (for example rpm:300)
    commander->registerCommandHandler("rpm", callback(handleRpmCommand, commander));

    // requests for lidar state
    commander->registerCommandHandler("lidar", callback(handleLidarCommand, commander));

    // requests for current main battery voltage
    commander->registerCommandHandler("voltage", callback(handleVoltageCommand, commander));

    // requests for current motor currents
    commander->registerCommandHandler("current", callback(handleCurrentCommand, commander));

    // requests for current state, reports various information
    commander->registerCommandHandler("state", callback(handleStateCommand, commander));

    // forwards given message to other commander, useful for remote control etc
    commander->registerCommandHandler("proxy", callback(handleProxyCommand, commander));

    // responds with 'pong', useful for measuring connection latency
    commander->registerCommandHandler("ping", callback(handlePingCommand, commander));

    // kills the board after stopping motors
    commander->registerCommandHandler("die", callback(handleDieCommand, commander));
  }
}

void setupMotors()
{
  // stop motors
  setMotorSpeeds(0, 0);

  // reset encoder values
  bool writeSuccess = motors.resetEncoders(MOTOR_CONTROLLER_ADDRESS);

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

void setupImu()
{
  // attempt to initialize
  if (!imu.begin())
  {
    // no IMU is available, blink the error led
    die(Error::ERROR_IMU_NOT_AVAILABLE, "communicating with LSM9DS1 IMU failed");
  }

  printf("! calibrating IMU.. ");

  // TODO: also needs a way to calibrate the compass
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
    printf("! usb %s\n", isConnected ? "connected" : "disconnected");

    // notify app of reset
    if (isConnected)
    {
      // notify of reset
      send("reset\n");
    }

    wasUsbConnected = isConnected;
  }

  // turn the usb status led on when connected
  usbStatusLed = isConnected;
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

void stepBatteryVoltageReporter()
{
  if (std::chrono::duration_cast<std::chrono::milliseconds>(reportBatteryVoltageTimer.elapsed_time()).count() < REPORT_BATTERY_VOLTAGE_INTERVAL_MS)
  {
    return;
  }

  reportBatteryVoltageTimer.reset();

  // the voltage is only reported if has changed from previous report
  reportBatteryVoltage();
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
    send("m:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d\n", measurement1->angle, measurement1->distance, measurement1->quality, measurement2->angle, measurement2->distance, measurement2->quality, measurement3->angle, measurement3->distance, measurement3->quality, measurement4->angle, measurement4->distance, measurement4->quality);
  } while (true);
}

void stepImu()
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
    // TODO: send attitude quaternion instead of roll-pitch-yaw?
    // TODO: send IMU reading and calculate AHRS on the app side to reduce CPU load
    send("a:%d:%d:%d\n", (int)round(roll * 100.0f), (int)round(pitch * 100.0f), (int)round(yaw * 100.0f));
  }
}

void stepRearLedStrip()
{
  // update animator
  rearLedNeedsUpdate = ledAnimator.update();

  // skip if nothing changed
  if (!rearLedNeedsUpdate)
  {
    return;
  }

  // update real led strip state
  rearLedController.write(rearLedStrip.getBuf());

  rearLedNeedsUpdate = false;
}

void stepHeartbeat()
{
  int timeSinceLastHeartbeatMs = std::chrono::duration_cast<std::chrono::milliseconds>(reportHeartbeatTimer.elapsed_time()).count();

  cycleCountSinceLastHeartbeat++;

  if (timeSinceLastHeartbeatMs < HEARTBEAT_INTERVAL_MS)
  {
    return;
  }

  // toggle loop status led
  loopStatusLed = !loopStatusLed;

  // calculate main loop execution frequency (should be the same as cycleCountSinceLastHeartbeat)
  int loopFrequency = ceil(((float)cycleCountSinceLastHeartbeat / (float)timeSinceLastHeartbeatMs) * 1000.0f);

  // send connection alive heartbeat message

  send("h:%d:%d\n", loopFrequency, loadPercentage);

  // update ahrs sample frequency (matches loop execution frequency)
  ahrs.setSampleFrequency(loopFrequency);

  reportHeartbeatTimer.reset();
  cycleCountSinceLastHeartbeat = 0;
}

void setupTimers()
{
  // start timers
  updateRearLedTimer.start();
  performanceTimer.start();
  reportHeartbeatTimer.start();
  reportLidarStateTimer.start();
  reportBatteryVoltageTimer.start();
  loopTimer.start();
}

const int SLOW_OPERATION_THRESHOLD_US = 1000; // 1ms

void s()
{
  performanceTimer.reset();
}

void d(const char *name, int slowThreshold = SLOW_OPERATION_THRESHOLD_US)
{
  int elapsedUs = performanceTimer.elapsed_time().count();

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
  setupImu();
  setupTimers();

  printf("! initialization complete!\n");

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
    // stepImu();
    // d("stepImu", 4000);

    s();
    stepRearLedStrip();
    d("stepRearLedStrip");

    s();
    stepEncoderReporter();
    d("stepEncoderReporter", 3000);

    s();
    stepBatteryVoltageReporter();
    d("stepBatteryVoltageReporter", 3000);

    s();
    stepHeartbeat();
    d("stepHeartbeat");

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
