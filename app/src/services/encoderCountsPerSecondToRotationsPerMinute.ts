import { config } from "../config";

const rotationsPerMinutePerEncoderCountsPerSecond =
  (1 / (config.vehicle.encoderCountsPerRotation * config.vehicle.gearboxRatio)) * 60.0;

export function encoderCountsPerSecondToRotationsPerMinute(countsPerSecond: number) {
  return countsPerSecond * rotationsPerMinutePerEncoderCountsPerSecond;
}
