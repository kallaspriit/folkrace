import { atom } from "recoil";

// represents motor currents in amps
export interface CurrentsState {
  readonly left: number;
  readonly right: number;
}

export const currentsState = atom<CurrentsState>({
  key: "currentsState",
  default: {
    left: 0,
    right: 0,
  },
});
