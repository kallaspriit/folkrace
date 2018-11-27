import { Container } from "unstated";

export interface LidarMeasurement {
  readonly angle: number;
  readonly distance: number;
  readonly quality: number;
  readonly date: Date;
}

export interface State {
  readonly measurements: LidarMeasurement[];
}

export class MeasurementsContainer extends Container<State> {
  readonly state: State = {
    measurements: []
  };

  add(measurement: LidarMeasurement) {
    return this.setState({
      measurements: [...this.state.measurements, measurement]
    });
  }
}
