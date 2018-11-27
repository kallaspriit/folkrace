import { Container } from "unstated";

export interface State {
  readonly targetSpeed: {
    readonly left: number;
    readonly right: number;
  };
  readonly current: {
    readonly left: number;
    readonly right: number;
  };
}

export class RobotContainer extends Container<State> {
  readonly state: State = {
    targetSpeed: {
      left: 0,
      right: 0
    },
    current: {
      left: 0,
      right: 0
    }
  };

  setTargetSpeed(left: number, right: number) {
    void this.setState({
      targetSpeed: {
        left,
        right
      }
    });
  }

  setCurrent(left: number, right: number) {
    void this.setState({
      current: {
        left,
        right
      }
    });
  }
}
