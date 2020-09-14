import { useRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { currentsState } from "../state/currentsState";

export function useHandleCurrentCommand() {
  const [, setCurrents] = useRecoilState(currentsState);

  // for example "current:1253:1314" means 12.53A for the left motor and 13.14A for the right
  return (args: string[]) => {
    assertArgumentCount(args, 2);

    // current is reported in 100ths of amps
    const left = parseInt(args[0], 10) / 100.0;
    const right = parseInt(args[1], 10) / 100.0;

    setCurrents({
      left,
      right,
    });
  };
}
