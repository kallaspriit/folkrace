import { useRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { attitudeState } from "../state/attitudeState";

export function useHandleAttitudeCommand() {
  const [, setAttitude] = useRecoilState(attitudeState);

  // for example "a:123:234:345" means roll 1.23 degrees roll, 2.32 degrees pitch, 3.45 degrees yaw
  return (args: string[]) => {
    assertArgumentCount(args, 3);

    const roll = parseInt(args[0], 10) / 100;
    const pitch = parseInt(args[1], 10) / 100;
    const yaw = parseInt(args[2], 10) / 100;

    setAttitude({
      roll,
      pitch,
      yaw,
    });
  };
}
