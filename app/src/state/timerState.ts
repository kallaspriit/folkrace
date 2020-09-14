import { atom } from "recoil";

export const timerState = atom<number>({
  key: "timerState",
  default: Date.now(),
});
