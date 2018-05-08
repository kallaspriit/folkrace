#include <mbed.h>

#include "SerialLogHandler.hpp"

SerialLogHandler::SerialLogHandler(Serial *serial, Log::LogLevel minimumLevel) : LogHandler(minimumLevel), serial(serial)
{
}

void SerialLogHandler::handleLogMessage(Log::LogLevel level, const char *component, const char *message)
{
  if (level < minimumLevel)
  {
    return;
  }

  // serialMutex.lock();

  serial->printf("# %-5s | %-35s | %s\n", logLevelToName(level), component, message);

  // serialMutex.unlock();
};