import { dummyLogger, Logger } from "ts-log";

export interface ExampleOptions {
  readonly log?: Logger;
}

export class Example {
  private readonly options: Required<ExampleOptions>;
  private readonly log: Logger;

  constructor(options: ExampleOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.log = this.options.log;
  }
}
