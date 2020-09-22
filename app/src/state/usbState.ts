import { atom } from "recoil";

// represents usb connection details
export interface UsbState {
  readonly vendorId: number;
  readonly productId: number;
  readonly name: string;
}

export const usbState = atom<UsbState | undefined>({
  key: "usbState",
  default: undefined,
});
