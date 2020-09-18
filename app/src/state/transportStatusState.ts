import { atom } from "recoil";
import { TransportStatus } from "../lib/transport";

export const transportStatusState = atom<TransportStatus>({
  key: "transportStatusState",
  default: TransportStatus.DISCONNECTED,
});
