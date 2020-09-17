import { atom } from "recoil";

export const lastHeartbeatTimeState = atom<Date | undefined>({
  key: "lastHeartbeatTimeState",
  default: undefined,
});
