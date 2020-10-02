import { atom } from "recoil";

// represents current odometry position (also includes velocity and angle)
export interface OdometryPosition {
  readonly velocity: {
    readonly x: number;
    readonly y: number;
  };
  readonly position: {
    readonly x: number;
    readonly y: number;
  };
  readonly angle: number;
}

// initial default position
export const initialOdometryPosition: OdometryPosition = {
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

export const odometryPositionState = atom<OdometryPosition>({
  key: "odometryPositionState",
  default: initialOdometryPosition,
});
