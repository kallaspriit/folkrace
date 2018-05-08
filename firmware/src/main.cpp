#include <mbed.h>

#include "Commander.hpp"

int main()
{
  // configure serials
  Serial pcSerial(USBTX, USBRX, 115200);
  Serial robotSerial(p9, p10, 9600);

  // configure commanders
  Commander pcCommander(&pcSerial);
  Commander robotCommander(&robotSerial);

  // simple counter for testing
  int counter = 0;

  // main loop
  while (true)
  {
    pcSerial.printf("hello %d\n", counter);
    robotSerial.printf("hello %d\n", counter);

    wait(1.0f);

    counter++;
  }
}