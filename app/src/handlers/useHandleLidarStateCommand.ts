import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { lidarStatusState } from "../state/lidarStatusState";

export function useHandleLidarStateCommand() {
  const setLidarStatus = useSetRecoilState(lidarStatusState);

  // for example "l:1:1:3002:2987:56" means lidar is running and valid
  // with target rpm 300.2, current rpm 298.7 and pwm duty 56%
  return (args: string[]) => {
    assertArgumentCount(args, 5);

    const isRunning = parseInt(args[0], 10) === 1;
    const isValid = parseInt(args[1], 10) === 1;
    const targetRpm = parseInt(args[2], 10) / 10;
    const currentRpm = parseInt(args[3], 10) / 10;
    const motorPwm = parseInt(args[4], 10) / 100;

    setLidarStatus({
      isRunning,
      isValid,
      targetRpm,
      currentRpm,
      motorPwm,
    });
  };
}
