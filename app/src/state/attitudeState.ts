import { atom } from "recoil";

export interface AhrsAttitude {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
}

export const attitudeState = atom<AhrsAttitude | undefined>({
  key: "attitudeState",
  default: undefined,
});
