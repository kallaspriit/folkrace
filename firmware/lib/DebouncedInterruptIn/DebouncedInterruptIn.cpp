#include "DebouncedInterruptIn.hpp"

#include <Callback.h>

DebouncedInterruptIn::DebouncedInterruptIn(PinName pin, PinMode mode, std::chrono::microseconds debounceDuration) : interrupt(pin), debounceDuration(debounceDuration), isDebouncing(false)
{
  // set pin mode if special
  if (mode != PullNone)
  {
    interrupt.mode(mode);
  }

  // read initial state
  state = interrupt.read();
  // nextState = state;

  // register fall and rise callbacks
  interrupt.fall(callback(this, &DebouncedInterruptIn::handleFall));
  interrupt.rise(callback(this, &DebouncedInterruptIn::handleRise));
}

void DebouncedInterruptIn::handleFall()
{
  // nextState = 0;

  if (!isDebouncing)
  {
    state = 0;
    isDebouncing = true;
  }

  debounceTimeout.attach(callback(this, &DebouncedInterruptIn::clearDebouncing), debounceDuration);
}

void DebouncedInterruptIn::handleRise()
{
  // nextState = 1;

  if (!isDebouncing)
  {
    state = 1;
    isDebouncing = true;
  }

  debounceTimeout.attach(callback(this, &DebouncedInterruptIn::clearDebouncing), debounceDuration);
}

void DebouncedInterruptIn::clearDebouncing()
{
  isDebouncing = false;

  state = interrupt.read();
}

int DebouncedInterruptIn::read()
{
  return state;
}