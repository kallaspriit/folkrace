#include <mbed.h>

#include "Commander.hpp"

// configure serials
Serial pcSerial(USBTX, USBRX, 115200);
Serial robotSerial(p9, p10, 9600);

// configure commanders
Commander pcCommander(&pcSerial);
Commander robotCommander(&robotSerial);

void handleSumCommand(Commander *cmd)
{
  unsigned int argumentCount = cmd->getArgumentCount();
  int sum = 0;

  for (unsigned int i = 0; i < argumentCount; i++)
  {
    sum += cmd->getIntArgument(i);
  }

  cmd->serial->printf("> sum:%d\n", sum);
}

int main()
{
  // setup command handlers
  pcCommander.registerCommandHandler("sum", callback(handleSumCommand, &pcCommander));
  robotCommander.registerCommandHandler("sum", callback(handleSumCommand, &robotCommander));

  // simple counter for testing
  int counter = 0;

  // main loop
  while (true)
  {
    pcSerial.printf("# hello %d\n", counter);
    robotSerial.printf("# hello %d\n", counter);

    wait(1.0f);

    counter++;
  }
}
