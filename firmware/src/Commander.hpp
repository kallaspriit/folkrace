#ifndef COMMANDER_HPP
#define COMMANDER_HPP

#include <mbed.h>

class Commander
{
public:
  Commander(Serial *serial);

  void handleSerialRx();

private:
  static const int MAX_COMMAND_LENGTH = 128;
  static const int COMMAND_BUFFER_SIZE = MAX_COMMAND_LENGTH + 1;

  Serial *serial;
  char commandBuffer[COMMAND_BUFFER_SIZE];
  int commandLength = 0;
};

#endif