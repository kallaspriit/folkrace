import { Container } from "unstated";

export interface State {
  readonly left: number;
  readonly right: number;
}

export default class OdometryContainer extends Container<State> {
  readonly state: State = {
    left: 0,
    right: 0
  };

  update(left: number, right: number) {
    void this.setState({
      left,
      right
    });
  }
}
