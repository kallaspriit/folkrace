#include "LedAnimator.hpp"

LedAnimator::LedAnimator(
    PixelArray *pixelArray,
    int ledCount,
    int resolution,
    float dropoffPercentage,
    std::chrono::microseconds updateInterval,
    float speed) : pixelArray(pixelArray),
                   ledCount(ledCount),
                   resolution(resolution),
                   dropoffPercentage(dropoffPercentage),
                   updateInterval(updateInterval),
                   speed(speed),
                   mode(Mode::IDLE),
                   stateDuration(0),
                   stateTimeLeft(0),
                   isSyncRequired(false),
                   position(0),
                   dir(1)
{
  maxIntensity = pow(2, resolution) - 1;
  dropoffValue = (int)((float)maxIntensity * dropoffPercentage);
  // overscan = floor(1.0f / dropoffPercentage);
  overscan = 1;

  goIdle();

  lastUpdateTimer.start();
}

void LedAnimator::setMode(Mode newMode)
{
  mode = newMode;
  lastUpdateTimer.reset();
}

bool LedAnimator::update()
{
  auto elapsedTime = lastUpdateTimer.elapsed_time();

  if (elapsedTime >= updateInterval)
  {
    unsigned long dt = std::chrono::duration_cast<std::chrono::milliseconds>(elapsedTime).count();

    step(dt);

    lastUpdateTimer.reset();
  }

  return isSyncRequired;
}

void LedAnimator::step(unsigned long dt)
{
  switch (mode)
  {
  case Mode::IDLE:
    stepIdle(dt);
    break;

  case Mode::COUNTDOWN:
    stepCountdown(dt);
    break;
  }
}

void LedAnimator::goIdle()
{
  dir = 1;
  position = 0;

  setMode(Mode::IDLE);
}

void LedAnimator::stepIdle(unsigned long dt)
{
  int highEdge = ledCount - 1 + overscan;
  int lowEdge = -overscan;
  position += (float)dir * speed * (float)dt;

  if (position >= highEdge)
  {
    position = highEdge;
    dir = -1;
    // position = ledCount - 1;
  }
  else if (position <= lowEdge)
  {
    position = lowEdge;
    dir = 1;
    // position = 0;
  }

  float positionDiff;
  int intensity;

  for (int i = 0; i < ledCount; i++)
  {
    if (
        (dir == 1 && i > position) || (dir == -1 && i < position)
        //|| (position == -1)
    )
    {
      intensity = 0;
    }
    else
    {
      positionDiff = fabs(position - (float)i);
      intensity = min(max((int)(maxIntensity - positionDiff * (float)dropoffValue), 0), maxIntensity);
    }

    bool isFirstLed = i == 0;
    bool isLastLed = i == ledCount - 1;

    // keep edge leds full on when overscanning
    if (
        (position > ledCount - 1 && isLastLed) || (position < 0 && isFirstLed))
    {
      intensity = maxIntensity;
    }

    setLedColor(i, 255, 0, 0, intensity);
  }
}

void LedAnimator::goCountdown(unsigned long duration)
{
  stateDuration = duration;
  stateTimeLeft = duration;

  setMode(Mode::COUNTDOWN);
}

void LedAnimator::stepCountdown(unsigned long dt)
{
  float progress = 1.0f - ((float)stateTimeLeft / (float)stateDuration);
  float progressLedIndex = progress * (float)ledCount;
  float positionDiff;
  float intensity;

  for (int i = 0; i < ledCount; i++)
  {
    positionDiff = progressLedIndex - (float)i;

    if (positionDiff >= 1.0f)
    {
      intensity = maxIntensity;
    }
    else if (positionDiff > 0.0f)
    {
      intensity = positionDiff * maxIntensity;
    }
    else
    {
      intensity = 0;
    }

    setLedColor(i, 255, 0, 0, intensity);
  }

  // make sure we don't go negative so it wraps over
  if (stateTimeLeft > dt)
  {
    stateTimeLeft -= dt;
  }
  else
  {
    stateTimeLeft = 0;
  }

  if (stateTimeLeft == 0)
  {
    goIdle();
  }
}

void LedAnimator::setLedColor(int index, unsigned char red, unsigned char green, unsigned char blue, unsigned char brightness)
{
  pixelArray->SetI(index, brightness);
  pixelArray->SetR(index, red);
  pixelArray->SetG(index, green);
  pixelArray->SetB(index, blue);

  isSyncRequired = true;
}