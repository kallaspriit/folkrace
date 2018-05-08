#include "Commander.hpp"

#include <Callback.h>

Commander::Commander(Serial *serial) : serial(serial)
{
  serial->attach(callback(this, &Commander::handleSerialRx), Serial::RxIrq);
}

void Commander::handleSerialRx()
{
  char receivedChar = serial->getc();

  if (receivedChar == '\n')
  {
    // commandManager.handleCommand(CommandSource::SERIAL, commandBuffer, commandLength);

    serial->printf("> %s\n", commandBuffer);

    commandBuffer[0] = '\0';
    commandLength = 0;
  }
  else
  {
    if (commandLength > MAX_COMMAND_LENGTH - 1)
    {
      serial->printf("# maximum command length is %d characters, stopping at %s", MAX_COMMAND_LENGTH, commandBuffer);
    }

    commandBuffer[commandLength++] = receivedChar;
    commandBuffer[commandLength] = '\0';
  }
}