#include <mbed.h>
// #include <USBSerial.h>

#include "Commander.hpp"
#include "RoboClaw.hpp"
#include "Lidar.hpp"

// timing configuration
const int REPORT_ENCODER_VALUES_INTERVAL_MS = 1000; // larger interval for testing

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

// baud rates configuration
const int LOG_SERIAL_BAUDRATE = 115200;
const int APP_SERIAL_BAUDRATE = 1382400; // 115200
const int MOTOR_SERIAL_BAUDRATE = 115200;

// component configuration
const uint8_t MOTOR_SERIAL_ADDRESS = 128;

// setup serials
Serial logSerial(LOG_SERIAL_TX_PIN, USBRX, LOG_SERIAL_BAUDRATE);
// USBSerial logSerial;
Serial appSerial(APP_SERIAL_TX_PIN, APP_SERIAL_RX_PIN, APP_SERIAL_BAUDRATE);

// setup commanders
Commander logCommander(&logSerial);
Commander appCommander(&appSerial);

// setup motor controller
RoboClaw motors(MOTOR_SERIAL_ADDRESS, MOTOR_SERIAL_BAUDRATE, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_TX_PIN);

// setup lidar
Lidar lidar(LIDAR_TX_PIN, LIDAR_RX_PIN, LIDAR_PWM_PIN);

// setup timers
Timer reportEncoderValuesTimer;

// setup status leds
DigitalOut led1(LED1);

// keep track of encoder values
int lastEncoderDeltaM1 = 0;
int lastEncoderDeltaM2 = 0;

// handles set-speed:A:B command where A and B are the target speeds for motor 1 and 2
void handleSetSpeedCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();

  // make sure we got the right number of parameters
  if (argumentCount != 2)
  {
    commander->serial->printf("@ set-speed:A:B expects exactly two parameters (where A is motor 1 speed and B is motor 2 speed)\n");

    // stop the motors when receiving invalid command
    motors.setSpeedM1(0);
    motors.setSpeedM2(0);

    return;
  }

  // get targeet motor speeds
  int targetSpeedM1 = commander->getIntArgument(0);
  int targetSpeedM2 = commander->getIntArgument(1);

  // set motor speeds
  motors.setSpeedM1(targetSpeedM1);
  motors.setSpeedM2(targetSpeedM2);

  // report new target speeds
  logSerial.printf("set-speed:%d:%d\n", targetSpeedM1, targetSpeedM2);
  appSerial.printf("set-speed:%d:%d\n", targetSpeedM1, targetSpeedM2);
}

// handles set-lidar-rpm:RPM command, starts or stops the lidar setting target RPM
void handleSetLidarRpmCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();

  // make sure we got the right number of parameters
  if (argumentCount != 1)
  {
    commander->serial->printf("@ set-lidar-rpm:RPM expects exactly one parameter (where RPM is the new target lidar rpm)\n");

    // stop the lidar when receiving invalid command
    lidar.setTargetRpm(0);

    return;
  }

  int targetRpm = commander->getIntArgument(0);

  lidar.setTargetRpm(targetRpm);

  // report new target rpm
  logSerial.printf("set-lidar-rpm:%d\n", targetRpm);
  appSerial.printf("set-lidar-rpm:%d\n", targetRpm);
}

// handles get-lidar-state command, sends back lidar RPM, whether lidar is running and valid, queued command count
void handleGetLidarStateCommand(Commander *commander)
{
  commander->serial->printf("get-lidar-state:%.1f:%d:%d:%.2f\n", lidar.getRpm(), lidar.isStarted() ? 1 : 0, lidar.isValid() ? 1 : 0, lidar.getMotorPwm());
}

// handles get-voltage command, responds with main battery voltage
void handleGetVoltageCommand(Commander *commander)
{
  // apparently the reported values is slightly off
  bool isValid;
  float voltage = motors.getMainBatteryVoltage(&isValid) * 1.02;

  // report the voltage
  commander->serial->printf("get-voltage:%.1f:%d\n", voltage, isValid ? 1 : 0);
}

// handles get-current command, responds with current draws of both motors
void handleGetCurrentCommand(Commander *commander)
{
  CurrentMeasurement currents = motors.getCurrents();

  logSerial.printf("get-current:%.2f:%.2f:%d\n", currents.currentM1, currents.currentM2, currents.isValid ? 1 : 0);
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
  commander->serial->printf("# proxying \"%s\" to %s commander\n", command.c_str(), commander == &logCommander ? "robot" : "pc");

  // forward the command to the other serial
  otherCommander->handleCommand(command);
}

// reports encoder values
void reportEncoderValues()
{
  // variables to store status and validity
  uint8_t statusM1, statusM2;
  bool validM1, validM2;

  // read encoder values
  int encoderDeltaM1 = (int)motors.getEncoderDeltaM1(&statusM1, &validM1);
  int encoderDeltaM2 = (int)motors.getEncoderDeltaM2(&statusM2, &validM2);

  // make sure we got valid results
  if (!validM1 || !validM2)
  {
    logSerial.printf("@ reading motor encoders failed, is the power supply to the motor controller missing?\n");

    return;
  }

  // don't bother sending the update if the speeds have not changed
  if (abs(encoderDeltaM1 - lastEncoderDeltaM1) == 0 && abs(encoderDeltaM2 - lastEncoderDeltaM2) == 0)
  {
    return;
  }

  // keep track of last values
  lastEncoderDeltaM1 = encoderDeltaM1;
  lastEncoderDeltaM2 = encoderDeltaM2;

  // send the encoder values (TODO: only the app needs these)
  logSerial.printf("e:%d:%d\n", encoderDeltaM1, encoderDeltaM2);
  appSerial.printf("e:%d:%d\n", encoderDeltaM1, encoderDeltaM2);
}

int main()
{
  // notify of reset/startup
  logSerial.printf("reset\n");
  appSerial.printf("reset\n");

  // sets target motor speeds
  logCommander.registerCommandHandler("set-speed", callback(handleSetSpeedCommand, &logCommander));
  appCommander.registerCommandHandler("set-speed", callback(handleSetSpeedCommand, &appCommander));

  // sets target lidar rpm
  logCommander.registerCommandHandler("set-lidar-rpm", callback(handleSetLidarRpmCommand, &logCommander));
  appCommander.registerCommandHandler("set-lidar-rpm", callback(handleSetLidarRpmCommand, &appCommander));

  // reports lidar state
  logCommander.registerCommandHandler("get-lidar-state", callback(handleGetLidarStateCommand, &logCommander));
  appCommander.registerCommandHandler("get-lidar-state", callback(handleGetLidarStateCommand, &appCommander));

  // reports battery voltage
  logCommander.registerCommandHandler("get-voltage", callback(handleGetVoltageCommand, &logCommander));
  appCommander.registerCommandHandler("get-voltage", callback(handleGetVoltageCommand, &appCommander));

  // reports motor currents
  logCommander.registerCommandHandler("get-current", callback(handleGetCurrentCommand, &logCommander));
  appCommander.registerCommandHandler("get-current", callback(handleGetCurrentCommand, &appCommander));

  // proxy forwards the command to the other commander, useful for remote control etc
  logCommander.registerCommandHandler("proxy", callback(handleProxyCommand, &logCommander));
  appCommander.registerCommandHandler("proxy", callback(handleProxyCommand, &appCommander));

  // reset motor encoders
  motors.resetEncoders();

  // start timers
  reportEncoderValuesTimer.start();

  // start the lidar
  // lidar.start();

  // // main loop
  while (true)
  {
    // update commanders
    logCommander.handleAllQueuedCommands();
    appCommander.handleAllQueuedCommands();

    // report encoder values at certain interval
    int msSinceLastEncoderValuesReport = reportEncoderValuesTimer.read_ms();

    if (msSinceLastEncoderValuesReport >= REPORT_ENCODER_VALUES_INTERVAL_MS)
    {
      reportEncoderValues();

      reportEncoderValuesTimer.reset();
    }

    // output the queued lidar measurements
    while (lidar.getQueuedMeasurementCount() > 0)
    {
      // pop next measurement
      LidarMeasurement *measurement = lidar.popQueuedMeasurement();

      // only send valid and strong measurements
      if (measurement->isValid && measurement->isStrong)
      {
        appSerial.printf("m:%d:%d:%d\n", measurement->angle, measurement->distance / 10, measurement->quality);
      }

      // make sure to delete it afterwards
      delete measurement;
    }

    // blink the led on every main loop
    led1 = !led1;
  }
}
