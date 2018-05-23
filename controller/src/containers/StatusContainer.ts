import { Container } from "unstated";
import { WebSocketState } from "../lib/web-socket-client/index";

export interface StatusState {
  webSocketState: WebSocketState;
}

export default class StatusContainer extends Container<StatusState> {
  public readonly state: StatusState = {
    webSocketState: WebSocketState.DISCONNECTED,
  };

  public setWebSocketState(newState: WebSocketState) {
    this.setState({
      webSocketState: newState,
    });
  }
}
