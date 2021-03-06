import { dummyLogger, Logger } from "ts-log";
import { Transport, TransportListener, TransportStatus } from "./Transport";

export interface MultiTransportOptions {
  log?: Logger;
}

export class MultiTransport implements Transport {
  private readonly options: Required<MultiTransportOptions>;
  private readonly listeners: TransportListener[] = [];
  private readonly transports: Transport[] = [];

  constructor(options: MultiTransportOptions = {}) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
  }

  get log() {
    return this.options.log;
  }

  getName() {
    const activeTransport = this.getActiveTransport();

    // return none if no transport is available
    if (!activeTransport) {
      return "None";
    }

    // return active transport name
    return activeTransport.getName();
  }

  isAvailable() {
    return this.getAvailableTransport() !== undefined;
  }

  getState() {
    const activeTransport = this.getActiveTransport();

    // return disconnected if no transport is available
    if (!activeTransport) {
      return TransportStatus.DISCONNECTED;
    }

    // return active transport state
    return activeTransport.getState();
  }

  addListener(listener: TransportListener) {
    this.listeners.push(listener);

    const activeTransport = this.getActiveTransport();

    if (!activeTransport) {
      return;
    }

    // report initial state
    listener.onStatusChanged(activeTransport, activeTransport.getState(), TransportStatus.DISCONNECTED);
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
    // call connect on all disconnected transports
    const promises = this.transports.map((transport) => {
      if (transport.getState() !== TransportStatus.DISCONNECTED) {
        return Promise.resolve();
      }

      return transport.connect();
    });

    // wait for all transports to connect
    await Promise.all(promises);
  }

  send(message: string) {
    const connectedTransport = this.getConnectedTransport();

    if (!connectedTransport) {
      this.log.warn(`sending message "${message}" requested but there is no connected transport available`);

      // notify of failed message sending attempt
      this.listeners.forEach((listener) => listener.onMessageSent(this, message, false));

      return false;
    }

    return connectedTransport.send(message);
  }

  addTransport(transport: Transport) {
    // listen for transport events and forward active transport events
    transport.addListener({
      onStatusChanged: (eventTransport, newState, previousState) => {
        const activeTransport = this.getActiveTransport();

        if (eventTransport !== activeTransport) {
          return;
        }

        this.listeners.forEach((listener) => listener.onStatusChanged(eventTransport, newState, previousState));
      },
      onError: (eventTransport, error) => {
        const activeTransport = this.getActiveTransport();

        if (eventTransport !== activeTransport) {
          return;
        }

        this.listeners.forEach((listener) => listener.onError(eventTransport, error));
      },
      onMessageSent: (eventTransport, message, wasSentSuccessfully: boolean) => {
        const activeTransport = this.getActiveTransport();

        if (eventTransport !== activeTransport) {
          return;
        }

        this.listeners.forEach((listener) => listener.onMessageSent(eventTransport, message, wasSentSuccessfully));
      },
      onMessageReceived: (eventTransport, message) => {
        const activeTransport = this.getActiveTransport();

        if (eventTransport !== activeTransport) {
          return;
        }

        this.listeners.forEach((listener) => listener.onMessageReceived(eventTransport, message));
      },
    });

    this.transports.push(transport);
  }

  getAvailableTransport() {
    // return first available transport
    return this.transports.find((transport) => transport.isAvailable());
  }

  getConnectedTransport() {
    // return first connected transport if any
    return this.transports.find((transport) => transport.getState() === TransportStatus.CONNECTED);
  }

  getActiveTransport() {
    const connectedTransport = this.getConnectedTransport();

    // return first connected transport if exists
    if (connectedTransport) {
      return connectedTransport;
    }

    // return first available transport if exists
    return this.getAvailableTransport();
  }
}
