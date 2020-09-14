import { atom } from "recoil";

// represents encoder steps values
export interface EncodersState {
  left: number;
  right: number;
}

export const encodersState = atom<EncodersState>({
  key: "encodersState",
  default: {
    left: 0,
    right: 0,
  },
});
