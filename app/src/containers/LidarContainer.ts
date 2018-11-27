import { Container } from "unstated";

export interface LidarState {
  readonly isStarted: boolean;
  readonly isValid: boolean;
  readonly targetRpm: number;
  readonly currentRpm: number;
  readonly motorPwm: number;
}

export interface LidarMeasurement {
  readonly angle: number;
  readonly distance: number;
  readonly quality: number;
  readonly date: Date;
}

export interface LidarMeasurements {
  readonly measurements: LidarMeasurement[];
}

// TODO: measure samples per second
export type State = LidarState & LidarMeasurements;

// TODO: move measurements to a different container?
export class LidarContainer extends Container<State> {
  readonly state: State = {
    isStarted: false,
    isValid: false,
    targetRpm: 0,
    currentRpm: 0,
    motorPwm: 0,
    measurements: []
  };

  updateLidarState(state: LidarState) {
    void this.setState({
      ...state
    });
  }

  addMeasurement(measurement: LidarMeasurement) {
    void this.setState({
      measurements: [...this.state.measurements, measurement]
    });
  }
}
