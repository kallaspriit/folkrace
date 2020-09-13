import { atom } from "recoil";

export const loadState = atom<number | undefined>({
  key: "loadState",
  default: undefined,
});
