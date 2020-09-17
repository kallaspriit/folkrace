import { atom } from "recoil";

// represents motor speeds in amps
export interface TargetSpeedsState {
  left: number;
  right: number;
}

export const targetSpeedsState = atom<TargetSpeedsState>({
  key: "targetSpeedsState",
  default: {
    left: 0,
    right: 0,
  },
});
