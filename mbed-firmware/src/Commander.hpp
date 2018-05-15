#ifndef COMMANDER_HPP
#define COMMANDER_HPP

#include <mbed.h>

#include <string>
#include <map>
#include <vector>
#include <queue>

typedef Callback<void()> CommandHandlerCallback;
typedef std::map<std::string, CommandHandlerCallback> CommandHandlerMap;
typedef std::queue<std::string> CommandQueue;

class Commander
{
public:
  Commander(Serial *serial);

  void registerCommandHandler(std::string name, CommandHandlerCallback handler);
  void handleCommand(std::string command);

  unsigned int getArgumentCount();
  std::string getStringArgument(unsigned int index);
  int getIntArgument(unsigned int index);

  void handleAllQueuedCommands();

  Serial *serial;

private:
  void handleSerialRx();

  static const int MAX_COMMAND_LENGTH = 128;
  static const int COMMAND_BUFFER_SIZE = MAX_COMMAND_LENGTH + 1;
  static const int MAX_COMMAND_QUEUE_LENGTH = 32;

  char commandBuffer[COMMAND_BUFFER_SIZE];
  int commandLength = 0;
  CommandQueue commandQueue;
  CommandHandlerMap commandHandlerMap;
  std::vector<std::string> tokens;
};

#endif