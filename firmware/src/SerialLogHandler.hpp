#ifndef SERIAL_LOG_HANDLER_HPP
#define SERIAL_LOG_HANDLER_HPP

#include <mbed.h>

#include "Log.hpp"

class SerialLogHandler : public Log::LogHandler
{

public:
  SerialLogHandler(Serial *serial, Log::LogLevel minimumLevel);

  void handleLogMessage(Log::LogLevel level, const char *component, const char *message);

private:
  Serial *serial;
};

#endif