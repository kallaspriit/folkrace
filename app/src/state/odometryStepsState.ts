import { atom } from "recoil";
import { Motion } from "../lib/tracked-vehicle-kinematics";

// represents one odometry step
export interface OdometryStep {
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
  readonly angle: number;
  readonly motion: Motion;
}

export const initialOdometryStep: OdometryStep = {
  position: {
    x: 0,
    y: 0,
  },
  angle: 0,
  motion: {
    velocity: {
      x: 0,
      y: 0,
    },
    omega: 0,
  },
};

export const odometryStepsState = atom<OdometryStep[]>({
  key: "odometryStepsState",
  default: [initialOdometryStep],
});
