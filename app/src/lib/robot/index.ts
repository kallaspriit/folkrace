import { Transport } from "../transport/Transport";

export type SendArgument = string | number;

export class Robot {
  pingSentTime?: number;

  constructor(private readonly transport: Transport) {}

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
      this.send("!ping");
    } else {
      // send full ping, responded by the MCU
      this.send("ping");
    }
  }

  // don't use directly, add new robot method
  private send(command: string, ...args: SendArgument[]) {
    const message = `${command}${args.length > 0 ? ":" : ""}${args.join(":")}`;

    this.transport.send(message);
  }
}
