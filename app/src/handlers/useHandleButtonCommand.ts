import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { buttonsState } from "../state/buttonsState";

type ButtonName = "left" | "right" | "start";

export function useHandleButtonCommand() {
  const setButtons = useSetRecoilState(buttonsState);

  // for example "button:start:1" means start button is pressed, "button:left:0" means left bumper was released
  return (args: string[]) => {
    assertArgumentCount(args, 2);

    const buttonName = args[0] as ButtonName;
    const isPressed = parseInt(args[1], 10) === 1;

    setButtons((buttons) => ({
      left: buttonName === "left" ? isPressed : buttons.left,
      right: buttonName === "right" ? isPressed : buttons.right,
      start: buttonName === "start" ? isPressed : buttons.start,
    }));
  };
}
