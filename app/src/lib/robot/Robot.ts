import { Transport } from "../transport/Transport";

export interface RobotConfig {
  targetLidarRpm?: number;
}

export type SendArgument = string | number;

export class Robot {
  pingSentTime?: number;

  private readonly config: Required<RobotConfig>;

  constructor(private readonly transport: Transport, config: RobotConfig = {}) {
    this.config = {
      targetLidarRpm: 300,
      ...config,
    };
  }

  requestVoltage() {
    this.send("voltage");
  }

  requestCurrent() {
    this.send("current");
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

  startLidar(): void {
    this.send(`rpm:${this.config.targetLidarRpm}`);
  }

  stopLidar(): void {
    this.send("rpm:0");
  }

  // don't use directly, add new robot method
  private send(command: string, ...args: SendArgument[]) {
    const message = `${command}${args.length > 0 ? ":" : ""}${args.join(":")}`;

    this.transport.send(message);
  }
}
