#ifndef LEDANIMATOR_HPP
#define LEDANIMATOR_HPP

#include <PixelArray.hpp>

class LedAnimator
{

public:
  enum Mode
  {
    IDLE,
    COUNTDOWN,
  };

  LedAnimator(
      PixelArray *pixelArray,
      int ledCount,
      int resolution = 8,
      float dropoffPercentage = 0.2f,
      std::chrono::microseconds updateInterval = 16ms,
      float speed = 0.015f);

  bool update();

  void goIdle();
  void goCountdown(unsigned long duration = 1000);

  void setMode(Mode newMode);

protected:
  void setLedColor(int index, unsigned char red, unsigned char green, unsigned char blue, unsigned char brightness = 255);

  void step(unsigned long dt);

  void stepIdle(unsigned long dt);
  void stepCountdown(unsigned long dt);

  // user parameters
  PixelArray *pixelArray;
  int ledCount;
  int resolution;
  float dropoffPercentage;
  std::chrono::microseconds updateInterval;
  float speed;
  Mode mode;

  // calculated parameters
  int maxIntensity;
  int dropoffValue;
  int overscan;

  // runtime variables
  unsigned long stateDuration;
  unsigned long stateTimeLeft;
  bool isSyncRequired;

  Timer lastUpdateTimer;

  float position;
  int dir;
};

#endif
