import { atom } from "recoil";
import { TransportState } from "../lib/transport";

export const transportStatusState = atom<TransportState>({
  key: "transportStatusState",
  default: TransportState.DISCONNECTED,
});
