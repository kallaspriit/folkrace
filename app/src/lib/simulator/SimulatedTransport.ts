import { dummyLogger, Logger } from "ts-log";

import { Transport, TransportListener, TransportStatus } from "../transport";

import { SimulatedRobot } from "./SimulatedRobot";

export interface SimulatedTransportOptions {
  simulatedRobot: SimulatedRobot;
  readonly log?: Logger;
}

export class SimulatedTransport implements Transport {
  private readonly options: Required<SimulatedTransportOptions>;
  private readonly listeners: TransportListener[] = [];
  private state = TransportStatus.DISCONNECTED;

  constructor(options: SimulatedTransportOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };

    // listen for simulated robot messages
    this.options.simulatedRobot.addMessageListener((message) => this.onMessageReceived(message));
  }

  get log() {
    return this.options.log;
  }

  removeListener(_listener: TransportListener): void {
    throw new Error("Method not implemented.");
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
    this.setState(TransportStatus.CONNECTING);

    this.send("!handshake");
  }

  send(message: string) {
    // send the message to the simulated robot
    this.options.simulatedRobot.receive(message);

    this.listeners.forEach((listener) => listener.onMessageSent(this, message, true));

    return true;
  }

  private setState(newState: TransportStatus) {
    // ignore if state did not change
    if (newState === this.state) {
      return;
    }

    // remember previous state
    const previousState = this.state;

    // update current state
    this.state = newState;

    // notify the listeners of state change
    this.listeners.forEach((listener) => listener.onStatusChanged(this, newState, previousState));
  }

  private onMessageReceived(message: string) {
    this.log.info(`received: "${message}"`);

    // notify the listeners of message received
    this.listeners.forEach((listener) => listener.onMessageReceived(this, message));

    // handle handshake response
    if (message === "!handshake") {
      // consider connection successful
      this.setState(TransportStatus.CONNECTED);
    }
  }
}
