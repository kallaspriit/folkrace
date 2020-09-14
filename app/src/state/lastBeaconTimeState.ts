import { atom } from "recoil";

export const lastBeaconTimeState = atom<Date | undefined>({
  key: "lastBeaconTimeState",
  default: undefined,
});
