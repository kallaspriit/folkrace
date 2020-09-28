import { atom } from "recoil";

// represents target motor speeds in encoder counts per second (QPPS)
export interface TargetSpeedsState {
  readonly left: number;
  readonly right: number;
}

export const targetSpeedsState = atom<TargetSpeedsState>({
  key: "targetSpeedsState",
  default: {
    left: 0,
    right: 0,
  },
});
