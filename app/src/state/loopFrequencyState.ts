import { atom } from "recoil";

export const loopFrequencyState = atom<number | undefined>({
  key: "loopFrequencyState",
  default: undefined,
});
