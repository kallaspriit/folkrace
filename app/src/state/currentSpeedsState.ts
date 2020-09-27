import { atom } from "recoil";

// represents current motor speeds in ticks per second
export interface CurrentSpeedsState {
  readonly left: number;
  readonly right: number;
}

export const currentSpeedsState = atom<CurrentSpeedsState>({
  key: "currentSpeedsState",
  default: {
    left: 0,
    right: 0,
  },
});
