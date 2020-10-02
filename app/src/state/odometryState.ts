import { selector } from "recoil";
import { Pose } from "../lib/tracked-vehicle-kinematics";
import { odometryPoseState } from "./odometryPoseState";
import { odometryStepsState } from "./odometryStepsState";

// combines odometry position and steps because they need to be updated at the same time
export const odometryState = selector<[Pose, Pose[]]>({
  key: "odometryState",
  get: ({ get }) => {
    const odometryPose = get(odometryPoseState);
    const odometrySteps = get(odometryStepsState);

    return [odometryPose, odometrySteps];
  },
  set: ({ get, set }, args) => {
    const [odometryPose, odometrySteps] = args as [Pose, Pose[]];

    console.log("set odometryState", { get, set, odometryPose, odometrySteps });

    set(odometryPoseState, odometryPose);
    set(odometryStepsState, odometrySteps);
  },
});
