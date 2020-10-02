import { selector } from "recoil";
import { OdometryPosition, odometryPositionState } from "./odometryPositionState";
import { OdometryStep, odometryStepsState } from "./odometryStepsState";

// combines odometry position and steps because they need to be updated at the same time
export const odometryState = selector<[OdometryPosition, OdometryStep[]]>({
  key: "odometryState",
  get: ({ get }) => {
    const odometryPosition = get(odometryPositionState);
    const odometrySteps = get(odometryStepsState);

    return [odometryPosition, odometrySteps];
  },
  set: ({ get, set }, args) => {
    const [odometryPosition, odometrySteps] = args as [OdometryPosition, OdometryStep[]];

    console.log("set odometryState", { get, set, odometryPosition, odometrySteps });

    set(odometryPositionState, odometryPosition);
    set(odometryStepsState, odometrySteps);
  },
});
