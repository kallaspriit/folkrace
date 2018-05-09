#include <mbed.h>

#include "Commander.hpp"

// configure serials
Serial pcSerial(USBTX, USBRX, 115200);
Serial robotSerial(p9, p10, 115200);

// configure commanders
Commander pcCommander(&pcSerial);
Commander robotCommander(&robotSerial);

void handleSumCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();
  int sum = 0;

  for (unsigned int i = 0; i < argumentCount; i++)
  {
    sum += commander->getIntArgument(i);
  }

  commander->serial->printf("> sum:%d\n", sum);
}

void handleForwardCommand(Commander *commander)
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
  commander->serial->printf("# forwarding \"%s\" to %s commander\n", command.c_str(), commander == &pcCommander ? "robot" : "pc");

  // forward the command to the other serial
  otherCommander->handleCommand(command.c_str(), command.length());
}

int main()
{
  // notify of reset/startup
  pcSerial.printf("reset\n");
  robotSerial.printf("reset\n");

  // setup command handlers
  pcCommander.registerCommandHandler("sum", callback(handleSumCommand, &pcCommander));
  robotCommander.registerCommandHandler("sum", callback(handleSumCommand, &robotCommander));

  pcCommander.registerCommandHandler("forward", callback(handleForwardCommand, &pcCommander));
  robotCommander.registerCommandHandler("forward", callback(handleForwardCommand, &robotCommander));

  // simple counter for testing
  // int counter = 0;

  // // main loop
  // while (true)
  // {
  //   pcSerial.printf("# hello %d\n", counter);
  //   robotSerial.printf("# hello %d\n", counter);

  //   wait(1.0f);

  //   counter++;
  // }
}
