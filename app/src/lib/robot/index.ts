import { WebSocketClient } from "../web-socket-client";

export type SendArgument = string | number;

export class Robot {
  constructor(private webSocketClient: WebSocketClient) {}

  requestVoltage() {
    this.send("voltage");
  }

  requestState() {
    this.send("state");
  }

  setSpeed(left: number, right: number) {
    this.send("s", left, right);
  }

  ping() {
    this.send("ping");
  }

  // don't use directly, add new robot method
  private send(command: string, ...args: SendArgument[]) {
    const message = `${command}${args.length > 0 ? ":" : ""}${args.join(":")}`;

    this.webSocketClient.send(message);
  }
}
