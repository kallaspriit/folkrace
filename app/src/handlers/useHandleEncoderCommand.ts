import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { encodersState } from "../state/encodersState";

export function useHandleEncoderCommand() {
  const setEncoders = useSetRecoilState(encodersState);

  // for example "e:1253:1314" means left motor has travelled 1253 steps and right 1314 steps
  return (args: string[]) => {
    assertArgumentCount(args, 2);

    const left = parseInt(args[0], 10);
    const right = parseInt(args[1], 10);

    setEncoders({
      left,
      right,
    });
  };
}
