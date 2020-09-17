import { atom } from "recoil";

export interface LidarStatus {
  isRunning: boolean;
  isValid: boolean;
  targetRpm: number;
  currentRpm: number;
  motorPwm: number;
}

export const lidarStatusState = atom<LidarStatus | undefined>({
  key: "lidarStatusState",
  default: undefined,
});
