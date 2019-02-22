import { Container } from "unstated";

export interface State {
  readonly isStarted: boolean;
  readonly isValid: boolean;
  readonly targetRpm: number;
  readonly currentRpm: number;
  readonly motorPwm: number;
}

export class LidarContainer extends Container<State> {
  readonly state: State = {
    isStarted: false,
    isValid: false,
    targetRpm: 0,
    currentRpm: 0,
    motorPwm: 0,
  };

  update(state: State) {
    return this.setState({
      ...state,
    });
  }
}
