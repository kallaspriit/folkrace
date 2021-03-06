import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { targetSpeedsState } from "../state/targetSpeedsState";

export function useHandleTargetSpeedCommand() {
  const setTargetSpeeds = useSetRecoilState(targetSpeedsState);

  // for example "s:1253:1314" means left speed 1253 and right speed 1314
  return (args: string[]) => {
    assertArgumentCount(args, 2);

    const left = parseInt(args[0], 10);
    const right = parseInt(args[1], 10);

    setTargetSpeeds({
      left,
      right,
    });
  };
}
