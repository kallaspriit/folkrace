#include <mbed.h>

int main()
{
  // configure usb serial
  Serial pc(USBTX, USBRX, 115200);

  // setup bluetooth serial
  Serial bt(p9, p10, 9600);

  // simple counter for testing
  int counter = 0;

  // main loop
  while (true)
  {
    pc.printf("hello %d\n", counter);
    bt.printf("hello %d\n", counter);

    wait(1.0f);

    counter++;
  }
}