import { dummyLogger, Logger } from "ts-log";

import { Transport, TransportListener, TransportStatus } from "./Transport";

interface BridgeInterface {
  receive(message: string): void;
}

// extend the global window interface with the bridge interfaces
declare global {
  interface Window {
    native?: BridgeInterface;
    app?: BridgeInterface;
  }
}

export interface NativeTransportOptions {
  log?: Logger;
}

export class NativeTransport implements Transport {
  private readonly options: Required<NativeTransportOptions>;
  private readonly log: Logger;
  private readonly listeners: TransportListener[] = [];
  private readonly bridgeExists: boolean;
  private state: TransportStatus = TransportStatus.DISCONNECTED;
  private native?: BridgeInterface;

  constructor(options: NativeTransportOptions = {}) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.log = this.options.log;
    this.bridgeExists = window.native !== undefined;
  }

  getName() {
    return "Native";
  }

  isAvailable() {
    return this.bridgeExists;
  }

  getState() {
    return this.state;
  }

  addListener(listener: TransportListener) {
    this.listeners.push(listener);
  }

  removeListener(listener: TransportListener) {
    const listenerIndex = this.listeners.findIndex((existingListener) => listener === existingListener);

    if (listenerIndex === -1) {
      return false;
    }

    this.listeners.splice(listenerIndex, 1);

    return true;
  }

  async connect() {
    // attempt to connect
    this.setState(TransportStatus.CONNECTING);

    // default to using mock interface if not available
    if (window.native === undefined) {
      this.log.info("no native bridge is available");

      // connection failed
      this.setState(TransportStatus.DISCONNECTED);

      return;
    }

    this.log.info("native bridge is available");

    // store reference to the native javascript bridge interface
    this.native = window.native;

    // setup native to app interface
    window.app = {
      receive: (message) => this.onMessageReceived(message),
    };

    // perform handshake to test connection
    this.send("!handshake");

    // set connecting state until handshake response is received
    this.setState(TransportStatus.CONNECTING);
  }

  send(message: string) {
    // fail to send if no bridge available
    if (!this.native) {
      this.log.warn(`sending message "${message}" requested but the native bridge is not available`);

      // notify of failed message sending attempt
      this.listeners.forEach((listener) => listener.onMessageSent(this, message, false));

      return false;
    }

    // attempt to send the message
    try {
      // call the receive native bridge function
      this.native.receive(message);

      // notify of message sent
      this.listeners.forEach((listener) => listener.onMessageSent(this, message, true));

      return true;
    } catch (error) {
      // notify of error
      this.listeners.forEach((listener) => listener.onError(this, error));
    }

    return false;
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
