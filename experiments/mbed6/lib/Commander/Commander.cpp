#include "Commander.hpp"

#include <Callback.h>
#include <sstream>
#include <vector>
#include <iterator>

Commander::Commander(BufferedSerial *bufferedSerial) : bufferedSerial(bufferedSerial)
{
}

// Commander::Commander(USBSerial *serial) : serial(serial), usb(serial)
// {
// }

void Commander::registerCommandHandler(std::string name, CommandHandlerCallback handler)
{
  commandHandlerMap[name] = handler;
}

void Commander::update()
{
  // read all available characters
  while (isReadable())
  {
    // read from serial
    int readLength = bufferedSerial->read(readBuffer, READ_BUFFER_SIZE);

    if (readLength == 0)
    {
      return;
    }

    for (int i = 0; i < readLength; i++)
    {
      char receivedChar = readBuffer[i];

      // printf("RECEIVED %c (%d) [%s] %d\n", receivedChar, receivedChar, commandBuffer, commandQueue.size());

      // consider linefeed as the end of command
      if (receivedChar == '\n')
      {
        // queue the command
        std::string command(commandBuffer, commandLength);

        handleCommand(command);

        // reset the buffer
        commandBuffer[0] = '\0';
        commandLength = 0;
      }
      else
      {
        // make sure we don't overflow our buffer
        if (commandLength > MAX_COMMAND_LENGTH - 1)
        {
          printf("@ maximum command length is %d characters, stopping at %s\n", MAX_COMMAND_LENGTH, commandBuffer);

          return;
        }

        // append to the command buffer
        commandBuffer[commandLength++] = receivedChar;
        commandBuffer[commandLength] = '\0';
      }
    }
  }
}

int Commander::send(const char *fmt, ...)
{
  va_list args;
  va_start(args, fmt);
  int resultLength = vsnprintf(sendBuffer, SEND_BUFFER_SIZE, fmt, args);
  va_end(args);

  bufferedSerial->write(sendBuffer, resultLength);

  return resultLength;
}

bool Commander::isReadable()
{
  if (bufferedSerial != NULL)
  {
    return bufferedSerial->readable();
  }

  return false;
}

void Commander::handleCommand(std::string command)
{
  // ignore empty commands
  if (command.length() == 0)
  {
    return;
  }

  // convert the command buffer to a string and split into token
  tokens = split(command, ':');

  // name is the first token
  std::string name = tokens.at(0);

  // attempt to find the command handler
  CommandHandlerMap::iterator handlerIt = commandHandlerMap.find(name);

  if (handlerIt != commandHandlerMap.end())
  {
    // log incoming command
    // TODO: remove received command logging?
    printf("< %s\n", command.c_str());

    // call the command handler if it exists
    handlerIt->second();
  }
  else
  {
    // log missing command handler
    printf("@ command \"%s\" not found (%s)\n", name.c_str(), command.c_str());
  }
}

unsigned int Commander::getArgumentCount()
{
  unsigned int tokenCount = tokens.size();

  return tokenCount > 0 ? tokens.size() - 1 : 0;
}

std::string Commander::getStringArgument(unsigned int index)
{
  unsigned int argumentCount = getArgumentCount();

  if (index > getArgumentCount() - 1)
  {
    printf("@ commander argument with index of %d requested but there are only %d arguments\n", index, argumentCount);

    return "";
  }

  return tokens.at(index + 1);
}

int Commander::getIntArgument(unsigned int index)
{
  std::string arg = getStringArgument(index);

  if (arg.length() == 0)
  {
    return 0;
  }

  return std::stoi(arg);
}

template <typename Out>
void Commander::split(const std::string &s, char delim, Out result)
{
  std::stringstream ss(s);
  std::string item;

  while (std::getline(ss, item, delim))
  {
    *(result++) = item;
  }
}

std::vector<std::string> Commander::split(const std::string &s, char delim)
{
  std::vector<std::string> elems;

  split(s, delim, std::back_inserter(elems));

  return elems;
}
