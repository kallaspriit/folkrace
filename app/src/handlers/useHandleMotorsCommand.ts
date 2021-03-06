import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { motorsConnectedState } from "../state/motorsConnectedState";

export function useHandleMotorsCommand() {
  const setMotorsConnected = useSetRecoilState(motorsConnectedState);

  // for example "motors:1" means communication with the motors board is working (motors:0 for not working)
  return (args: string[]) => {
    assertArgumentCount(args, 1);

    const isConnected = parseInt(args[0], 10) === 1;

    setMotorsConnected(isConnected);
  };
}
