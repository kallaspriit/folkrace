import { selector } from "recoil";
import { encoderCountsPerSecondToRotationsPerMinute } from "../services/encoderCountsPerSecondToRotationsPerMinute";
import { currentSpeedsState } from "./currentSpeedsState";

// represents current motor speeds in rotations per minute
export interface CurrentMotorRpmsState {
  readonly left: number;
  readonly right: number;
}

export const currentMotorRpmsState = selector<CurrentMotorRpmsState>({
  key: "currentMotorRpmsState",
  get: ({ get }) => {
    const currentSpeeds = get(currentSpeedsState);

    return {
      left: encoderCountsPerSecondToRotationsPerMinute(currentSpeeds.left),
      right: encoderCountsPerSecondToRotationsPerMinute(currentSpeeds.right),
    };
  },
});
