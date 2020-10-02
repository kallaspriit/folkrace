import { atom } from "recoil";
import { Pose } from "../lib/tracked-vehicle-kinematics";
import { initialOdometryPose } from "./odometryPoseState";

// represents one odometry step
export const odometryStepsState = atom<Pose[]>({
  key: "odometryStepsState",
  default: [initialOdometryPose],
});
