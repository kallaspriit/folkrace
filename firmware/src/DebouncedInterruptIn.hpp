#ifndef DEBOUNCED_INTERRUPT_IN_HPP
#define DEBOUNCED_INTERRUPT_IN_HPP

#include <mbed.h>

class DebouncedInterruptIn
{
public:
  DebouncedInterruptIn(PinName pin, PinMode mode = PullNone, int debounceDurationUs = 100);

  int read();

  InterruptIn interrupt;

private:
  void handleFall();
  void handleRise();

  Timer timer;
  int debounceDurationUs;
  int state;
  bool isStable;
};

#endif