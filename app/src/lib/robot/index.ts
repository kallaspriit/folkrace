import { WebSocketClient } from "../web-socket-client";

export type SendArgument = string | number;

export class Robot {
  pingSentTime?: number;

  constructor(private readonly webSocketClient: WebSocketClient) {}

  requestVoltage() {
    this.send("voltage");
  }

  requestState() {
    this.send("state");
  }

  setSpeed(left: number, right: number) {
    this.send("s", left, right);
  }

  ping(transportOnly = false) {
    this.pingSentTime = Date.now();

    if (transportOnly) {
      // send internal ping command if testing the transport only (Android responds to this)
      this.webSocketClient.send("!ping", false);
    } else {
      // send full ping, responded by the MCU
      this.send("ping");
    }
  }

  // don't use directly, add new robot method
  private send(command: string, ...args: SendArgument[]) {
    const message = `${command}${args.length > 0 ? ":" : ""}${args.join(":")}`;

    this.webSocketClient.send(message);
  }
}
