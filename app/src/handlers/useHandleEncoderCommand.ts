import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { currentSpeedsState, CurrentSpeedsState } from "../state/currentSpeedsState";
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

    setCurrentSpeeds((lastCurrentSpeeds) => {
      const { lastEncoderLeft, lastEncoderRight } = lastCurrentSpeeds;

      // calculate current speeds (needs last encoder values)
      const speeds: CurrentSpeedsState =
        lastEncoderLeft !== undefined && lastEncoderRight !== undefined
          ? {
              lastEncoderLeft: left,
              lastEncoderRight: right,
              left: (left - lastEncoderLeft) / timeSinceLastEncodersReportSeconds,
              right: (right - lastEncoderRight) / timeSinceLastEncodersReportSeconds,
            }
          : {
              lastEncoderLeft: left,
              lastEncoderRight: right,
              left: lastCurrentSpeeds.left,
              right: lastCurrentSpeeds.right,
            };

      return speeds;
    });
  };
}
