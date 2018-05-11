#ifndef COMMANDER_HPP
#define COMMANDER_HPP

#include <mbed.h>

#include <string>
#include <map>
#include <vector>

typedef Callback<void()> CommandHandlerCallback;
typedef std::map<std::string, CommandHandlerCallback> CommandHandlerMap;

class Commander
{
public:
  Commander(Serial *serial);

  void registerCommandHandler(std::string name, CommandHandlerCallback handler);
  void handleCommand(const char *command, int length);

  unsigned int getArgumentCount();
  std::string getStringArgument(unsigned int index);
  int getIntArgument(unsigned int index);

  void update();

  Serial *serial;

private:
  void handleSerialRx();

  static const int MAX_COMMAND_LENGTH = 128;
  static const int COMMAND_BUFFER_SIZE = MAX_COMMAND_LENGTH + 1;

  char commandBuffer[COMMAND_BUFFER_SIZE];
  int commandLength = 0;
  CommandHandlerMap commandHandlerMap;
  std::vector<std::string> tokens;
  std::vector<std::string>
};

#endif