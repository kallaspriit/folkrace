import { dummyLogger, Logger } from "ts-log";

import { Transport, TransportListener, TransportStatus } from "./Transport";

export interface WebsocketTransportOptions {
  host: string;
  port: number;
  useSSL?: boolean;
  reconnectInterval?: number;
  log?: Logger;
}

export class WebsocketTransport implements Transport {
  private readonly listeners: TransportListener[] = [];
  private options: Required<WebsocketTransportOptions>;
  private state: TransportStatus = TransportStatus.DISCONNECTED;
  private wasConnected = false;
  private ws?: WebSocket;
  private reconnectTimeout?: NodeJS.Timeout;

  constructor(options: WebsocketTransportOptions) {
    this.options = {
      useSSL: false,
      log: dummyLogger,
      reconnectInterval: 1000,
      ...options,
    };
  }

  get log() {
    return this.options.log;
  }

  getName() {
    return "WebSocket";
  }

  isAvailable() {
    return WebSocket !== undefined;
  }

  getOptions() {
    return this.options;
  }

  updateOptions(options: Partial<WebsocketTransportOptions>) {
    this.options = {
      ...this.options,
      ...options,
    };
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
    const url = `${this.options.useSSL ? "wss" : "ws"}://${this.options.host}:${this.options.port}`;

    this.log.info(`connecting to web-socket server at ${url}`);

    // close existing connection if exists
    if (this.ws) {
      console.log("closing connection", this.ws);

      // clear event handlers
      this.ws.onopen = () => {};
      this.ws.onclose = () => {};
      this.ws.onerror = () => {};
      this.ws.onmessage = () => {};

      // close the connection
      this.ws.close();

      this.ws = undefined;
    }

    // clear reconnect timeout if exists
    if (this.reconnectTimeout !== undefined) {
      clearTimeout(this.reconnectTimeout);

      this.reconnectTimeout = undefined;
    }

    // update state depending on whether the connection was ever established
    this.setState(this.wasConnected ? TransportStatus.RECONNECTING : TransportStatus.CONNECTING);

    // attempt to open web-socket connection
    this.ws = new WebSocket(url);

    // handle open event
    this.ws.onopen = (_event) => {
      this.log.info("established web-socket connection");

      this.wasConnected = true;

      // update state
      this.setState(TransportStatus.CONNECTED);
    };

    // handle close event
    this.ws.onclose = (event) => {
      const logDetails = `code: ${event.code}, reason: ${event.reason}, was clean: ${event.wasClean ? "yes" : "no"}`;

      if (this.wasConnected) {
        this.log.warn(`connection to web-socket was lost (${logDetails})`);
      } else {
        this.log.warn(`connecting to web-socket failed (${logDetails})`);
      }

      // update state
      this.setState(TransportStatus.DISCONNECTED);

      // only attempt to reconnect if connection has succeeded before
      if (this.wasConnected) {
        this.reconnectTimeout = setTimeout(() => {
          this.reconnectTimeout = undefined;

          void this.connect();
        }, this.options.reconnectInterval);
      }
    };

    // handle error event
    this.ws.onerror = (_event) => {
      this.log.warn("got web-socket error");

      // notify the listeners
      this.listeners.forEach((listener) => listener.onError(this));
    };

    // handle message event
    this.ws.onmessage = (event) => {
      const message = event.data;

      // this.log.info("got message", message);

      // notify the listeners of message received
      this.listeners.forEach((listener) => listener.onMessageReceived(this, message));
    };
  }

  send(message: string) {
    // we can only send messages if we're connected
    if (!this.ws || this.state !== TransportStatus.CONNECTED) {
      this.log.warn(`sending message "${message}" requested but websocket state is ${this.state}`);

      // notify of failed message sending attempt
      this.listeners.forEach((listener) => listener.onMessageSent(this, message, false));

      return false;
    }

    // send the message
    this.ws.send(message);

    // notify the listeners
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
}
