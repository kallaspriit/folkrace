import { Button, ButtonState } from "../containers/ButtonContainer";

import { ContainerMap } from "./";

export function handleButtonCommand(args: string[], { button }: ContainerMap) {
  const name = args[0];
  const state =
    parseInt(args[1], 10) === 0 ? ButtonState.PRESSED : ButtonState.RELEASED;

  void button.setButtonState(name.toUpperCase() as Button, state);
}
