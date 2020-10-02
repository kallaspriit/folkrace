import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { encoderCountsPerSecondToRotationsPerMinute } from "../services/encoderCountsPerSecondToRotationsPerMinute";
import { getEuclideanDistance } from "../services/getEuclideanDistance";
import { kinematics } from "../services/kinematics";
import { currentSpeedsState } from "../state/currentSpeedsState";
import { encodersState } from "../state/encodersState";
import { odometryState } from "../state/odometryState";
import { OdometryStep } from "../state/odometryStepsState";

export function useHandleEncoderCommand() {
  const setEncoders = useSetRecoilState(encodersState);
  const setCurrentSpeeds = useSetRecoilState(currentSpeedsState);
  const setOdometry = useSetRecoilState(odometryState);

  // for example "e:1253:1314" means left motor has travelled 1253 steps and right 1314 steps
  return (args: string[]) => {
    assertArgumentCount(args, 3);

    // get arguments
    const leftCountsSinceLastUpdate = parseInt(args[0], 10);
    const rightCountsSinceLastUpdate = parseInt(args[1], 10);
    const timeSinceLastEncoderReportUs = parseInt(args[2], 10);

    // time since last encoders report in seconds
    const dt = timeSinceLastEncoderReportUs / 1000000;

    // update encoder values
    setEncoders({
      left: leftCountsSinceLastUpdate,
      right: rightCountsSinceLastUpdate,
    });

    // calculate current speeds in encoder counts per second
    const currentSpeeds = {
      left: leftCountsSinceLastUpdate / dt,
      right: rightCountsSinceLastUpdate / dt,
    };

    // current speed is in encoder counts per second (QPPS)
    setCurrentSpeeds(currentSpeeds);

    // convert speeds from encoder counts per second to rotation per minute
    const trackRpms = {
      left: encoderCountsPerSecondToRotationsPerMinute(currentSpeeds.left),
      right: encoderCountsPerSecondToRotationsPerMinute(currentSpeeds.right),
    };

    // calculate kinematic motion
    const motion = kinematics.getMotionFromMotorRpms(trackRpms);

    // our coordinate system is rotated by 90 degrees
    // TODO: any way this is not needed?
    const coordinateSystemRotation = Math.PI / 2;

    setOdometry(([currentOdometryPosition, currentOdometrySteps]) => {
      // calculate angle change and updated angle
      const angleChange = motion.omega * dt;
      const updatedAngle = currentOdometryPosition.angle + angleChange / 2;

      // calculate position change, x speed is applied at 90 degrees (PI/2) offset
      const positionChange = {
        x:
          motion.velocity.y * Math.cos(updatedAngle + coordinateSystemRotation) * dt -
          motion.velocity.x * Math.cos(updatedAngle + coordinateSystemRotation + Math.PI / 2) * dt,
        y:
          motion.velocity.y * Math.sin(updatedAngle + coordinateSystemRotation) * dt -
          motion.velocity.x * Math.sin(updatedAngle + coordinateSystemRotation + Math.PI / 2) * dt,
      };

      // calculate update position
      const updatedPosition = {
        x: currentOdometryPosition.position.x + positionChange.x,
        y: currentOdometryPosition.position.y + positionChange.y,
      };

      // resove previous odometry step (there's always zero position/velocity initial step available)
      const previousOdometryStep: OdometryStep = currentOdometrySteps[currentOdometrySteps.length - 1];

      // calculate distance from new to previous step position
      const distance = getEuclideanDistance(updatedPosition, previousOdometryStep.position);

      // start with same steps as before
      const updatedOdometrySteps = [...currentOdometrySteps];

      // odometry steps configuration
      const maxOdometryLength = 1000;
      const odometryStepMinimumDistanceMeters = 0.05;

      // don't add new odometry step if distance from last is too small
      if (distance >= odometryStepMinimumDistanceMeters) {
        console.log("setOdometrySteps add", {
          velocity: motion.velocity,
          positionChange,
          updatedPosition,
          distance,
          currentOdometrySteps,
        });

        // remove first odometry step if maximum number of steps has been reached
        if (updatedOdometrySteps.length + 1 > maxOdometryLength) {
          updatedOdometrySteps.shift();
        }

        // add new odometry step
        updatedOdometrySteps.push({
          motion,
          angle: updatedAngle,
          position: updatedPosition,
        });
      }

      // update odometry position info
      return [
        {
          velocity: motion.velocity,
          position: updatedPosition,
          angle: updatedAngle,
        },
        updatedOdometrySteps,
      ];
    });
  };
}
