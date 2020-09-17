import { atom } from "recoil";

export const serverIpState = atom<string | undefined>({
  key: "serverIpState",
  default: undefined,
});
