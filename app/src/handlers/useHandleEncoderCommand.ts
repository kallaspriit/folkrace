import { useSetRecoilState } from "recoil";
import { config } from "../config";
import { MotorValue, TrackedVehicleKinematics } from "../lib/tracked-vehicle-kinematics";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { encoderCountsPerSecondToRotationsPerMinute } from "../services/encoderCountsPerSecondToRotationsPerMinute";
import { getEuclideanDistance } from "../services/getEuclideanDistance";
import { kinematics } from "../services/kinematics";
import { currentSpeedsState } from "../state/currentSpeedsState";
import { encodersState } from "../state/encodersState";
import { odometryState } from "../state/odometryState";

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
    const motorRpms: MotorValue = {
      left: encoderCountsPerSecondToRotationsPerMinute(currentSpeeds.left),
      right: encoderCountsPerSecondToRotationsPerMinute(currentSpeeds.right),
    };

    // calculate kinematic motion based on track motor rpms
    const motion = kinematics.getMotionFromMotorRpms(motorRpms);

    setOdometry(([currentOdometryPose, currentOdometrySteps]) => {
      // calculate updated pose based on motion
      const updatedPose = TrackedVehicleKinematics.getUpdatedPose(currentOdometryPose, motion, dt);

      // resove previous odometry step (there's always initial step available)
      const previousOdometryStep = currentOdometrySteps[currentOdometrySteps.length - 1];

      // calculate distance from new to previous step position
      const distance = getEuclideanDistance(updatedPose.position, previousOdometryStep.position);

      // start with same odometry steps as before
      const updatedOdometrySteps = [...currentOdometrySteps];

      // don't add new odometry step if distance from last is too small
      if (distance >= config.odometry.minimumStepDistanceMeters) {
        // remove first odometry step if maximum number of steps has been reached
        if (updatedOdometrySteps.length + 1 > config.odometry.maxStepCount) {
          updatedOdometrySteps.shift();
        }

        // add new odometry step
        updatedOdometrySteps.push(updatedPose);
      }

      // update odometry position info
      return [updatedPose, updatedOdometrySteps];
    });
  };
}
