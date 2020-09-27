import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { currentSpeedsState } from "../state/currentSpeedsState";
import { encodersState } from "../state/encodersState";

export function useHandleEncoderCommand() {
  const setEncoders = useSetRecoilState(encodersState);
  const setCurrentSpeeds = useSetRecoilState(currentSpeedsState);

  // for example "e:1253:1314" means left motor has travelled 1253 steps and right 1314 steps
  return (args: string[]) => {
    assertArgumentCount(args, 3);

    const left = parseInt(args[0], 10);
    const right = parseInt(args[1], 10);
    const timeSinceLastEncoderReportUs = parseInt(args[2], 10);
    const timeSinceLastEncodersReportSeconds = timeSinceLastEncoderReportUs / 1000000;

    setEncoders({
      left,
      right,
    });

    // TODO: convert from ticks per second to rotations per minute
    setCurrentSpeeds({
      left: left / timeSinceLastEncodersReportSeconds,
      right: right / timeSinceLastEncodersReportSeconds,
    });
  };
}
