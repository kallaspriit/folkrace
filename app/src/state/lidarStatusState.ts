import { atom } from "recoil";

export interface LidarStatus {
  readonly isRunning: boolean;
  readonly isValid: boolean;
  readonly targetRpm: number;
  readonly currentRpm: number;
  readonly motorPwm: number;
}

export const lidarStatusState = atom<LidarStatus | undefined>({
  key: "lidarStatusState",
  default: undefined,
});
