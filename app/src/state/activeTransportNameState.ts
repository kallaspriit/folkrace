import { atom } from "recoil";

export const activeTransportNameState = atom<string | undefined>({
  key: "activeTransportNameState",
  default: undefined,
});
