import { assertArgumentCount } from "../services/assertArgumentCount";
import { robot } from "../services/robot";

export function useHandleResetCommand() {
  // for example "reset", sent when native connection is reset
  return (args: string[]) => {
    // not expecting any arguments
    assertArgumentCount(args, 0);

    // ask for current robot state
    robot.requestState();
  };
}
