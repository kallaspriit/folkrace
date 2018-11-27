import { Container } from "unstated";

export interface State {
  readonly odometry: {
    readonly left: number;
    readonly right: number;
  };
  readonly targetSpeed: {
    readonly left: number;
    readonly right: number;
  };
}

export class OdometryContainer extends Container<State> {
  readonly state: State = {
    odometry: {
      left: 0,
      right: 0
    },
    targetSpeed: {
      left: 0,
      right: 0
    }
  };

  setOdometry(left: number, right: number) {
    void this.setState({
      odometry: {
        left,
        right
      }
    });
  }

  setTargetSpeed(left: number, right: number) {
    void this.setState({
      targetSpeed: {
        left,
        right
      }
    });
  }
}
