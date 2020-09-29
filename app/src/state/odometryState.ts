import { atom } from "recoil";
import { Motion } from "../lib/tracked-vehicle-kinematics";

// represents one odometry step
export interface OdometryStep {
  readonly motion: Motion;
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
  readonly angle: number;
}

export const initialOdometryStep: OdometryStep = {
  motion: {
    velocity: {
      x: 0,
      y: 0,
    },
    omega: 0,
  },
  position: {
    x: 0,
    y: 0,
  },
  angle: 0,
};

export const odometryState = atom<OdometryStep[]>({
  key: "odometryState",
  default: [initialOdometryStep],
});
