import { Container } from "unstated";

export interface LidarMeasurement {
  readonly angle: number;
  readonly distance: number;
  readonly quality: number;
  readonly timestamp: number;
}

export interface State {
  readonly measurements: LidarMeasurement[];
}

export class MeasurementsContainer extends Container<State> {
  readonly state: State = {
    measurements: [],
  };

  add(measurement: LidarMeasurement) {
    const measurements = [...this.state.measurements, measurement];

    // store a maximum of 360 measurements
    if (measurements.length > 360) {
      measurements.shift();
    }

    return this.setState({
      measurements,
    });
  }
}
