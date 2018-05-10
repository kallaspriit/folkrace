#include <mbed.h>

#include "Commander.hpp"
#include "RoboClaw.hpp"

/*
 * LINKS
 * - Download libraries
 *   https://os.mbed.com/code/
 */

// configure serials
Serial logSerial(USBTX, USBRX, 115200);
Serial appSerial(p9, p10, 115200);

// configure commanders
Commander pcCommander(&logSerial);
Commander robotCommander(&appSerial);

// motor controller
RoboClaw motors(128, 57600, p14, p13);

void handleSpeedCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();

  // make sure we got the right number of parameters
  if (argumentCount != 2)
  {
    commander->serial->printf("@ speed expects exactly two parameters, speed:1000-2000 sets M1 speed to 1000 and M2 speed to -2000");

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

  commander->serial->printf("new-speed:%d:%d\n", targetSpeedM1, targetSpeedM2);
}

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
  Commander *otherCommander = commander == &pcCommander ? &robotCommander : &pcCommander;

  // log forward attempt
  commander->serial->printf("# proxying \"%s\" to %s commander\n", command.c_str(), commander == &pcCommander ? "robot" : "pc");

  // forward the command to the other serial
  otherCommander->handleCommand(command.c_str(), command.length());
}

// void reportEncodersThread()
// {
//   while (true)
//   {
//     // uint8_t status = 0;
//   // bool encoderValidM1 = false;
//   // uint32_t encoderValueM1 = motors.ReadEncM1(&status, &encoderValidM1);
//   // commander->serial->printf("# motor encoder: %u, valid: %s\n", encoderValueM1, encoderValidM1 ? "yes" : "no");
//   }
// }

int main()
{
  // notify of reset/startup
  logSerial.printf("reset\n");
  appSerial.printf("reset\n");

  // speed:1000-2000 sets M1 speed to 1000 and M2 speed to -2000
  pcCommander.registerCommandHandler("speed", callback(handleSpeedCommand, &pcCommander));
  robotCommander.registerCommandHandler("speed", callback(handleSpeedCommand, &robotCommander));

  // proxy forwards the command to the other commander, useful for remote control etc
  pcCommander.registerCommandHandler("proxy", callback(handleProxyCommand, &pcCommander));
  robotCommander.registerCommandHandler("proxy", callback(handleProxyCommand, &robotCommander));

  // simple counter for testing
  // int counter = 0;

  // // main loop
  // while (true)
  // {
  //   logSerial.printf("# hello %d\n", counter);
  //   appSerial.printf("# hello %d\n", counter);

  //   wait(1.0f);

  //   counter++;
  // }
}
