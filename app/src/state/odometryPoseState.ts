import { atom } from "recoil";
import { Pose } from "../lib/tracked-vehicle-kinematics";

// initial default position
export const initialOdometryPose: Pose = {
  velocity: {
    x: 0,
    y: 0,
  },
  position: {
    x: 0,
    y: 0,
  },
  angle: 0,
};

export const odometryPoseState = atom<Pose>({
  key: "odometryPoseState",
  default: initialOdometryPose,
});
