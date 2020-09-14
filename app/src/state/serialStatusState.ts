import { atom } from "recoil";

export enum SerialStatus {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  NOT_SUPPORTED = "NOT_SUPPORTED",
  DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
  DISABLED = "DISABLED",
}

export const serialStatusState = atom<SerialStatus>({
  key: "serialStatusState",
  default: SerialStatus.DISCONNECTED,
});
