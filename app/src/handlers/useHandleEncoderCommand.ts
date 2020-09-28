import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { encoderCountsPerSecondToRotationsPerMinute } from "../services/encoderCountsPerSecondToRotationsPerMinute";
import { kinematics } from "../services/kinematics";
import { currentSpeedsState } from "../state/currentSpeedsState";
import { encodersState } from "../state/encodersState";
import { odometryState, OdometryStep, initialOdometryStep } from "../state/odometryState";

export function useHandleEncoderCommand() {
  const setEncoders = useSetRecoilState(encodersState);
  const setCurrentSpeeds = useSetRecoilState(currentSpeedsState);
  const setOdometry = useSetRecoilState(odometryState);

  // for example "e:1253:1314" means left motor has travelled 1253 steps and right 1314 steps
  return (args: string[]) => {
    assertArgumentCount(args, 3);

    const leftCountsSinceLastUpdate = parseInt(args[0], 10);
    const rightCountsSinceLastUpdate = parseInt(args[1], 10);
    const timeSinceLastEncoderReportUs = parseInt(args[2], 10);
    const timeSinceLastEncodersReportSeconds = timeSinceLastEncoderReportUs / 1000000;

    setEncoders({
      left: leftCountsSinceLastUpdate,
      right: rightCountsSinceLastUpdate,
    });

    const currentSpeeds = {
      left: leftCountsSinceLastUpdate / timeSinceLastEncodersReportSeconds,
      right: rightCountsSinceLastUpdate / timeSinceLastEncodersReportSeconds,
    };

    // current speed is in encoder counts per second (QPPS)
    setCurrentSpeeds(currentSpeeds);

    // convert speeds from encoder counts per second to rotation per minute
    const trackRpms = {
      left: encoderCountsPerSecondToRotationsPerMinute(currentSpeeds.left),
      right: encoderCountsPerSecondToRotationsPerMinute(currentSpeeds.right),
    };

    // calculate kinematic motion
    const motion = kinematics.calculateMotion(trackRpms);

    setOdometry((currentOdometrySteps) => {
      // resove previous odometry step (use all-zeroes initial step if none)
      const previousStep: OdometryStep =
        currentOdometrySteps.length > 0 ? currentOdometrySteps[currentOdometrySteps.length - 1] : initialOdometryStep;

      // add new odometry step
      return [
        ...currentOdometrySteps,
        {
          motion,
          position: {
            x: previousStep.position.x + motion.velocity.x,
            y: previousStep.position.y + motion.velocity.y,
          },
          angle: previousStep.angle + motion.omega,
        },
      ];
    });
  };
}
