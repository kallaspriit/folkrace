import { atom } from "recoil";

export interface ButtonsState {
  readonly left: boolean;
  readonly right: boolean;
  readonly start: boolean;
}

export const buttonsState = atom<ButtonsState>({
  key: "buttonsState",
  default: {
    left: false,
    right: false,
    start: false,
  },
});
