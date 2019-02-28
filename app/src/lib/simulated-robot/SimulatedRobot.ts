import { dummyLogger, Logger } from "ts-log";

export interface SimulatedRobotOptions {
  readonly log?: Logger;
}

export class SimulatedRobot {
  private readonly options: Required<SimulatedRobotOptions>;
  private readonly log: Logger;

  constructor(options: SimulatedRobotOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.log = this.options.log;
  }
}
