import { atom } from "recoil";
import { TransportState } from "../lib/transport";

export const transportState = atom<TransportState>({
  key: "transportState",
  default: TransportState.DISCONNECTED,
});
