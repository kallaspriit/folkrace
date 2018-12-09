import { Container } from "unstated";

export interface LidarMeasurement {
  readonly angle: number;
  readonly distance: number;
  readonly quality: number;
  readonly date: Date;
}

export interface Attitude {
  readonly roll: number;
  readonly pitch: number;
  readonly yaw: number;
}

export interface State extends Attitude {
  lastUpdated: Date;
}

export class AhrsContainer extends Container<State> {
  readonly state: State = {
    roll: 0,
    pitch: 0,
    yaw: 0,
    lastUpdated: new Date()
  };

  setAttitude(attitude: Attitude) {
    return this.setState({
      ...attitude,
      lastUpdated: new Date()
    });
  }
}
