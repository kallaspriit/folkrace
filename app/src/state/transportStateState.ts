import { atom } from "recoil";
import { TransportState } from "../lib/transport";

export const transportStateState = atom<TransportState>({
  key: "transportStateState",
  default: TransportState.DISCONNECTED,
});
