import WebSocketClient from "../web-socket-client";

export default class Robot {
  constructor(private webSocketClient: WebSocketClient) {}

  requestVoltage() {
    this.webSocketClient.send("get-voltage");
  }
}
