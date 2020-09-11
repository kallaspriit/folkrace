#ifndef DEBOUNCED_INTERRUPT_IN_HPP
#define DEBOUNCED_INTERRUPT_IN_HPP

#include <mbed.h>

class DebouncedInterruptIn
{
public:
  DebouncedInterruptIn(PinName pin, PinMode mode = PullUp, std::chrono::microseconds debounceTimeout = 100ms);

  int read();

private:
  InterruptIn interrupt;

  void handleFall();
  void handleRise();

  void clearDebouncing();

  Timeout debounceTimeout;
  std::chrono::microseconds debounceDuration;
  volatile int state;
  // volatile int nextState;
  volatile bool isDebouncing;
};

#endif