import { Container } from "unstated";

export enum Button {
  START = "START",
  LEFT = "LEFT",
  RIGHT = "RIGHT"
}

export enum ButtonState {
  UNKNOWN = "UNKNOWN",
  PRESSED = "PRESSED",
  RELEASED = "RELEASED"
}

export type State = { readonly [key in keyof typeof Button]: ButtonState };

export class ButtonContainer extends Container<State> {
  readonly state: State = {
    [Button.START]: ButtonState.UNKNOWN,
    [Button.LEFT]: ButtonState.UNKNOWN,
    [Button.RIGHT]: ButtonState.UNKNOWN
  };

  setButtonState(button: Button, state: ButtonState) {
    void this.setState({
      [button]: state
    });
  }
}
