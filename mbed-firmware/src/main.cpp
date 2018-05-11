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
const int APP_SERIAL_BAUDRATE = 115200;
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

// keep track of encoder values
int encoderDeltaM1 = 0;
int encoderDeltaM2 = 0;

// handles set-speed:A:B command where A and B are the target speeds for motor 1 and 2
void handleSetSpeedCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();

  // make sure we got the right number of parameters
  if (argumentCount != 2)
  {
    commander->serial->printf("@ set-speed expects exactly two parameters, set-speed:1000-2000 sets M1 speed to 1000 and M2 speed to -2000");

    // stop the motors when receiving invalid command
    motors.SpeedM1(0);
    motors.SpeedM2(0);

    return;
  }

  // get targeet motor speeds
  int targetSpeedM1 = commander->getIntArgument(0);
  int targetSpeedM2 = commander->getIntArgument(1);

  // set motor speeds
  motors.SpeedM1(targetSpeedM1);
  motors.SpeedM2(targetSpeedM2);

  // report new target speeds
  commander->serial->printf("target-speed:%d:%d\n", targetSpeedM1, targetSpeedM2);
}

// handles proxy:
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
  otherCommander->handleCommand(command.c_str(), command.length());
}

// reports encoder values
void reportEncoderValues()
{
  // variables to store status and validity
  uint8_t statusM1, statusM2;
  bool validM1, validM2;

  // read encoder values
  uint32_t encoderValueM1 = motors.ReadEncM1(&statusM1, &validM1);
  uint32_t encoderValueM2 = motors.ReadEncM2(&statusM2, &validM2);

  // keep track of last values
  int lastEncoderDeltaM1 = encoderDeltaM1;
  int lastEncoderDeltaM2 = encoderDeltaM2;

  // converting from unsigned to signed gives us absolute signed value
  encoderDeltaM1 = (int)encoderValueM1;
  encoderDeltaM2 = (int)encoderValueM2;

  // don't bother sending the update if the speeds have not changed
  if (abs(encoderDeltaM1 - lastEncoderDeltaM1) == 0 && abs(encoderDeltaM2 - lastEncoderDeltaM2) == 0)
  {
    return;
  }

  // send the encoder values
  logSerial.printf("e:%d:%d\n", encoderDeltaM1, encoderDeltaM2);
  appSerial.printf("e:%d:%d\n", encoderDeltaM1, encoderDeltaM2);
}

int main()
{
  // notify of reset/startup
  logSerial.printf("reset\n");
  appSerial.printf("reset\n");

  // set-speed:1000-2000 sets M1 speed to 1000 and M2 speed to -2000
  logCommander.registerCommandHandler("set-speed", callback(handleSetSpeedCommand, &logCommander));
  appCommander.registerCommandHandler("set-speed", callback(handleSetSpeedCommand, &appCommander));

  // proxy forwards the command to the other commander, useful for remote control etc
  logCommander.registerCommandHandler("proxy", callback(handleProxyCommand, &logCommander));
  appCommander.registerCommandHandler("proxy", callback(handleProxyCommand, &appCommander));

  // reset motor encoders
  motors.ResetEnc();

  // start timers
  reportEncoderValuesTimer.start();

  // set lidar duty cycle (TODO: simple speed controller)
  lidar.SetPWMDuty(0.65f);
  // lidar.StartData();

  // bool isLidarStarted = false;

  // // main loop
  while (true)
  {
    // update commanders
    logCommander.update();
    appCommander.update();

    // update lidar
    lidar.update();

    // report encoder values at certain interval
    int msSinceLastEncoderValuesReport = reportEncoderValuesTimer.read_ms();

    if (msSinceLastEncoderValuesReport >= REPORT_ENCODER_VALUES_INTERVAL_MS)
    {
      // reportEncoderValues();

      // float speed = lidar.GetSpeed();

      logSerial.printf("# rpm: %f\n", lidar.getRpm());

      // for (int i = 0; i < 360; i += 45)
      // {
      //   int distance = lidar.GetData(i);

      //   logSerial.printf("# distance at %d: %d\n", i, distance);
      // }

      // if (!isLidarStarted)
      // {
      //   lidar.StartData();

      //   isLidarStarted = true;
      // }

      reportEncoderValuesTimer.reset();
    }
  }
}
