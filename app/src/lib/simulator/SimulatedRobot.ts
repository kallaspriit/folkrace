import { dummyLogger, Logger } from "ts-log";

export interface SimulatedRobotOptions {
  readonly log?: Logger;
}

export type MessageListenerFn = (message: string) => void;

export class SimulatedRobot {
  private readonly options: Required<SimulatedRobotOptions>;
  private readonly log: Logger;
  private readonly messageListeners: MessageListenerFn[] = [];

  constructor(options: SimulatedRobotOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.log = this.options.log;
  }

  addMessageListener(listener: MessageListenerFn) {
    this.messageListeners.push(listener);

    this.reportVoltage();
  }

  send(message: string) {
    this.messageListeners.forEach(messageListener => messageListener(message));
  }

  receive(message: string) {
    this.log.info(`received "${message}"`);

    switch (message) {
      case "!handshake":
        this.reportHandshake();
        break;

      case "voltage":
        this.reportVoltage();
        break;
    }
  }

  private reportHandshake() {
    // respond to handshake
    this.send("!handshake");

    // also send initial state
    this.reportVoltage();
  }

  private reportVoltage() {
    this.send("voltage:15.9");
  }
}
