import { clamp } from "./clamp";

export interface RateConfig {
  rcRate: number;
  expoRate: number;
  superRate: number;
}

export function calculateControllerRate(
  value: number,
  { rcRate = 1.0, expoRate = 0.0, superRate = 0.7 }: RateConfig,
): number {
  let rateCommand = value === Number.POSITIVE_INFINITY ? 1 : value;
  const absValue = Math.abs(rateCommand);

  if (rcRate > 2.0) {
    rcRate = rcRate + 14.54 * (rcRate - 2.0);
  }

  if (expoRate !== 0) {
    rateCommand = rateCommand * Math.abs(rateCommand) ** 3 * expoRate + rateCommand * (1.0 - expoRate);
  }

  let angleRate = 200.0 * rcRate * rateCommand;

  if (superRate !== 0) {
    const rcSuperFactor = 1.0 / clamp(1.0 - absValue * superRate, 0.01, 1.0);

    angleRate *= rcSuperFactor;
  }

  // return maximum value for full input
  if (value === Number.POSITIVE_INFINITY) {
    return angleRate;
  }

  // calculate max output for value of 1
  const maxValue = calculateControllerRate(Number.POSITIVE_INFINITY, {
    rcRate,
    expoRate,
    superRate,
  });

  const result = angleRate / maxValue;

  // scale to 0..1 range
  return result;
}
