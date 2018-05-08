#include <mbed.h>

#include "SerialLogHandler.hpp"

int main()
{
  // configure serial
  Serial pc(USBTX, USBRX);
  pc.baud(115200);

  // set log handler to use along with the minimum level of detail to show
  Log::setLogHandler(new SerialLogHandler(&pc, Log::LogLevel::DEBUG));
  Log log = Log::getLog("main");
  log.info("-- FIRMWARE V1.3 --");

  // setup bluetooth serial
  Serial bt(p9, p10, 9600);

  // simple counter for testing
  int counter = 0;

  // main loop
  while (true)
  {
    log.info("test %d!", counter);

    bt.printf("hello %d\n", counter);

    // Thread::wait(1000);

    wait(1.0f);

    counter++;

    // put your main code here, to run repeatedly:
  }
}