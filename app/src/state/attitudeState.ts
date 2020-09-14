import { atom } from "recoil";

export interface AhrsAttitude {
  roll: number;
  pitch: number;
  yaw: number;
}

export const attitudeState = atom<AhrsAttitude | undefined>({
  key: "attitudeState",
  default: undefined,
});
