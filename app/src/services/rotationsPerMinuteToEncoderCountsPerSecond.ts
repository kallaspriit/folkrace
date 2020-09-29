import { config } from "../config";

const rotationsPerMinutePerEncoderCountsPerSecond =
  (1 / 60) * (config.vehicle.encoderCountsPerRotation * config.vehicle.gearboxRatio);

export function rotationsPerMinuteToEncoderCountsPerSecond(rotationsPerMinute: number) {
  return Math.round(rotationsPerMinute * rotationsPerMinutePerEncoderCountsPerSecond);
}
