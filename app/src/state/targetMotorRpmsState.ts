import { selector } from "recoil";
import { encoderCountsPerSecondToRotationsPerMinute } from "../services/encoderCountsPerSecondToRotationsPerMinute";
import { targetSpeedsState } from "./targetSpeedsState";

// represents target motor speeds in rotations per minute
export interface TargetMotorRpmsState {
  readonly left: number;
  readonly right: number;
}

export const targetMotorRpmsState = selector<TargetMotorRpmsState>({
  key: "targetMotorRpmsState",
  get: ({ get }) => {
    const targetSpeeds = get(targetSpeedsState);

    return {
      left: encoderCountsPerSecondToRotationsPerMinute(targetSpeeds.left),
      right: encoderCountsPerSecondToRotationsPerMinute(targetSpeeds.right),
    };
  },
});
