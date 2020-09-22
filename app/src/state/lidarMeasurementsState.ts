import { atom } from "recoil";

export interface LidarMeasurement {
  readonly angle: number;
  readonly distance: number;
  readonly quality: number;
  readonly timestamp: number;
}

export const lidarMeasurementsState = atom<LidarMeasurement[]>({
  key: "lidarMeasurementsState",
  default: [],
});
