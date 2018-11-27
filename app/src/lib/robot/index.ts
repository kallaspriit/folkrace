import { WebSocketClient } from "../web-socket-client";

export type SendArgument = string | number;

export class Robot {
  private pingSentTime?: number;

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

  ping() {
    this.pingSentTime = Date.now();

    this.send("ping");
  }

  getPingTimeTaken() {
    if (!this.pingSentTime) {
      return -1;
    }

    const timeTaken = Date.now() - this.pingSentTime;

    this.pingSentTime = undefined;

    return timeTaken;
  }

  // don't use directly, add new robot method
  private send(command: string, ...args: SendArgument[]) {
    const message = `${command}${args.length > 0 ? ":" : ""}${args.join(":")}`;

    this.webSocketClient.send(message);
  }
}
