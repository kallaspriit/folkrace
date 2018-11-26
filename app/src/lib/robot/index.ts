import WebSocketClient from "../web-socket-client";

export default class Robot {
  constructor(private webSocketClient: WebSocketClient) {}

  requestVoltage() {
    this.webSocketClient.send("voltage");
  }

  setSpeed(left: number, right: number) {
    this.webSocketClient.send(`s:${left}:${right}`); // alias for "speed"
  }
}
