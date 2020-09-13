import { atom } from "recoil";

export const voltageState = atom<number | undefined>({
  key: "voltageState",
  default: undefined,
});
