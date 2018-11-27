import { ContainerMap } from "../components/Router";
import { Button, ButtonState } from "../containers/ButtonContainer";

export function handleButtonCommand(args: string[], { button }: ContainerMap) {
  const name = args[0];
  const state =
    parseInt(args[1], 10) === 0 ? ButtonState.PRESSED : ButtonState.RELEASED;

  button.setButtonState(name.toUpperCase() as Button, state);
}
