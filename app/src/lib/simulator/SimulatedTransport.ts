import { dummyLogger, Logger } from "ts-log";

import { Transport, TransportListener, TransportState } from "../transport";

import { SimulatedRobot } from "./SimulatedRobot";

export interface SimulatedTransportOptions {
  simulatedRobot: SimulatedRobot;
  readonly log?: Logger;
}

export class SimulatedTransport implements Transport {
  private readonly options: Required<SimulatedTransportOptions>;
  private readonly log: Logger;
  private readonly listeners: TransportListener[] = [];
  private state = TransportState.DISCONNECTED;

  constructor(options: SimulatedTransportOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.log = this.options.log;

    // listen for simulated robot messages
    this.options.simulatedRobot.addMessageListener((message) =>
      this.onMessageReceived(message)
    );
  }

  getName() {
    return "Simulated robot";
  }

  isAvailable() {
    return true;
  }

  getState() {
    return this.state;
  }

  addListener(listener: TransportListener) {
    this.listeners.push(listener);
  }

  async connect() {
    this.setState(TransportState.CONNECTING);

    this.send("!handshake");
  }

  send(message: string) {
    // send the message to the simulated robot
    this.options.simulatedRobot.receive(message);

    this.listeners.forEach((listener) =>
      listener.onMessageSent(this, message, true)
    );

    return true;
  }

  private setState(newState: TransportState) {
    // ignore if state did not change
    if (newState === this.state) {
      return;
    }

    // remember previous state
    const previousState = this.state;

    // update current state
    this.state = newState;

    // notify the listeners of state change
    this.listeners.forEach((listener) =>
      listener.onStateChanged(this, newState, previousState)
    );
  }

  private onMessageReceived(message: string) {
    this.log.info(`received: "${message}"`);

    // notify the listeners of message received
    this.listeners.forEach((listener) =>
      listener.onMessageReceived(this, message)
    );

    // handle handshake response
    if (message === "!handshake") {
      // consider connection successful
      this.setState(TransportState.CONNECTED);
    }
  }
}
