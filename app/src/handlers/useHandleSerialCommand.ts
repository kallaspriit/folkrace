import { useRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { SerialStatus, serialStatusState } from "../state/serialStatusState";

type SerialType = "usb" | "bluetooth";

export function useHandleSerialStatusCommand() {
  const [, setSerialStatus] = useRecoilState(serialStatusState);

  // for example "button:start:1" means start button is pressed, "button:left:0" means left bumper was released
  return (args: string[]) => {
    assertArgumentCount(args, 2);

    const serialType = args[0] as SerialType;
    const serialStatus = args[1] as SerialStatus;

    // only support usb serial
    if (serialType !== "usb") {
      return;
    }

    setSerialStatus(serialStatus);
  };
}
