#include "Commander.hpp"

#include <Callback.h>
#include <sstream>
#include <vector>
#include <iterator>

Commander::Commander(Serial *serial) : serial(serial), ser(serial)
{
  // listen for receive events (can cause concurrency issues?)
  // serial->attach(callback(this, &Commander::handleSerialRx), Serial::RxIrq);
}

Commander::Commander(USBSerial *serial) : serial(serial), usb(serial)
{
  // Callback<void()> cb = callback(this, &Commander::handleSerialRx);

  // listen for receive events (can cause concurrency issues?)
  // serial->attach(cb);
}

void Commander::update()
{
  // read from serial
  handleSerialRx();
}

void Commander::registerCommandHandler(std::string name, CommandHandlerCallback handler)
{
  commandHandlerMap[name] = handler;
}

int Commander::handleAllQueuedCommands()
{
  int handledCommandCount = 0;

  // handle all queued commands
  while (commandQueue.size() > 0)
  {
    // get the queued command
    std::string command = commandQueue.front();
    commandQueue.pop();

    // printf("CONSUME: %s\n", command.c_str());

    // handle the command
    handleCommand(command);

    handledCommandCount++;
  }

  return handledCommandCount;
}

void Commander::handleSerialRx()
{
  // read all available characters
  while (isReadable())
  {
    // get next character
    char receivedChar = serial->getc();

    // printf("RECEIVED %c (%d) [%s] %d\n", receivedChar, receivedChar, commandBuffer, commandQueue.size());

    // consider linefeed as the end of command
    if (receivedChar == '\n')
    {
      // queue the command
      std::string command(commandBuffer, commandLength);
      commandQueue.push(command);

      // remove commands exceeding max queue length
      while (commandQueue.size() > MAX_COMMAND_QUEUE_LENGTH)
      {
        commandQueue.pop();
      }

      // reset the buffer
      commandBuffer[0] = '\0';
      commandLength = 0;
    }
    else
    {
      // make sure we don't overflow our buffer
      if (commandLength > MAX_COMMAND_LENGTH - 1)
      {
        serial->printf("@ maximum command length is %d characters, stopping at %s\n", MAX_COMMAND_LENGTH, commandBuffer);

        return;
      }

      // append to the command buffer
      commandBuffer[commandLength++] = receivedChar;
      commandBuffer[commandLength] = '\0';
    }
  }
}

bool Commander::isReadable()
{
  if (ser != NULL)
  {
    return ser->readable();
  }
  else if (usb != NULL)
  {
    return usb->available() > 0;
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
    // TODO: add back?
    // printf("< %s\n", command.c_str());

    // call the command handler if it exists
    handlerIt->second();
  }
  else
  {
    // log missing command handler
    serial->printf("@ command \"%s\" not found (%s)\n", name.c_str(), command.c_str());
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
    serial->printf("@ commander argument with index of %d requested but there are only %d arguments\n", index, argumentCount);

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

  // try
  // {
  return std::stoi(arg);
  // }
  // catch (...)
  // {
  //   serial->printf("@ commander argument with index of %d - \"%s\" could not be converted to integer, returning 0\n", index, arg.c_str());

  //   return 0;
  // }
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
