import { atom } from "recoil";

export interface ButtonsState {
  left: boolean;
  right: boolean;
  start: boolean;
}

export const buttonsState = atom<ButtonsState>({
  key: "buttonsState",
  default: {
    left: false,
    right: false,
    start: false,
  },
});
