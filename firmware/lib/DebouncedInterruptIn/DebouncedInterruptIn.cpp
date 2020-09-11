#include "DebouncedInterruptIn.hpp"

#include <Callback.h>

DebouncedInterruptIn::DebouncedInterruptIn(PinName pin, PinMode mode, int debounceDurationUs) : interrupt(pin), debounceDurationUs(debounceDurationUs)
{
  // set pin mode if special
  if (mode != PullNone)
  {
    interrupt.mode(mode);
  }

  // read initial state
  state = interrupt.read();
  isStable = true;

  // register fall and rise callbacks
  interrupt.fall(callback(this, &DebouncedInterruptIn::handleFall));
  interrupt.rise(callback(this, &DebouncedInterruptIn::handleRise));

  // start the debounce timer
  timer.start();
}

void DebouncedInterruptIn::handleFall()
{
  int timeSinceLastPressUs = timer.elapsed_time().count();

  // only update state if enough time since last request has passed
  if (state != 1)
  {
    return;
  }

  if (timeSinceLastPressUs > debounceDurationUs)
  {
    timer.reset();

    state = 0;
    isStable = true;
  }
  else
  {
    isStable = false;
  }
}

void DebouncedInterruptIn::handleRise()
{
  int timeSinceLastPressUs = timer.elapsed_time().count();

  // only update state if enough time since last request has passed
  if (state != 0)
  {
    return;
  }

  if (timeSinceLastPressUs > debounceDurationUs)
  {
    timer.reset();

    state = 1;
    isStable = true;
  }
  else
  {
    isStable = false;
  }
}

int DebouncedInterruptIn::read()
{
  int stableDurationUs = timer.elapsed_time().count();

  // update state if debounce duration has passed and the button state has changed
  if (!isStable && stableDurationUs > debounceDurationUs && interrupt.read() != state)
  {
    state = interrupt.read();

    timer.reset();
    isStable = true;
  }

  return state;
}