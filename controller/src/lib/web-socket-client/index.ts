import { Logger, dummyLogger } from "ts-log";

export interface WebSocketClientListener {
  onConnecting(ws: WebSocketClient, wasConnected: boolean): void;
  onOpen(ws: WebSocketClient, event: Event): void;
  onClose(ws: WebSocketClient, event: CloseEvent, wasConnected: boolean): void;
  onError(ws: WebSocketClient, event: Event, wasConnected: boolean): void;
  onMessage(ws: WebSocketClient, message: string): void;
  onStateChanged(ws: WebSocketClient, newState: WebSocketState, oldState: WebSocketState): void;
  onSendMessage(ws: WebSocketClient, e: string): void;
}

export interface WebSocketClientOptions {
  host: string;
  port: number;
  useSSL?: boolean;
  reconnectInterval?: number;
  log?: Logger;
}

export enum WebSocketState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  RECONNECTING = "RECONNECTING",
  CONNECTED = "CONNECTED",
}

export default class WebSocketClient {
  private connectionState: WebSocketState = WebSocketState.DISCONNECTED;
  private listeners: WebSocketClientListener[] = [];
  private ws: WebSocket;
  private options: Required<WebSocketClientOptions>;
  private log: Logger;
  private wasConnected = false;

  public constructor(options: WebSocketClientOptions) {
    this.options = {
      useSSL: false,
      log: dummyLogger,
      reconnectInterval: 1000,
      ...options,
    };
    this.log = this.options.log;

    const url = `${this.options.useSSL ? "wss" : "ws"}://${this.options.host}:${this.options.port}`;

    this.ws = this.connect(url);
  }

  public subscribe(listener: WebSocketClientListener) {
    this.listeners.push(listener);
  }

  public unsubscribe(listener: WebSocketClientListener) {
    this.listeners = this.listeners.filter(item => item !== listener);
  }

  public get state() {
    return this.connectionState;
  }

  public send(message: string, addNewLine = true) {
    // we can only send messages if we're connected
    if (this.state !== WebSocketState.CONNECTED) {
      this.log.warn(`sending message "${message}" requested but web-socket is ${this.connectionState}`);

      return;
    }

    // notify the listeners
    this.listeners.forEach(listener => listener.onSendMessage(this, message));

    // send the message
    this.ws.send(`${message}${addNewLine ? "\n" : ""}`);
  }

  private setState(newState: WebSocketState) {
    // return if state has not changed
    if (newState === this.connectionState) {
      return;
    }

    const oldState = this.connectionState;

    this.connectionState = newState;

    // notify the listeners
    this.listeners.forEach(listener => listener.onStateChanged(this, newState, oldState));
  }

  private connect(url: string): WebSocket {
    this.log.info(`connecting to web-socket server at ${url}`);

    // update state
    this.setState(this.wasConnected ? WebSocketState.RECONNECTING : WebSocketState.CONNECTING);

    // notify the listeners
    this.listeners.forEach(listener => listener.onConnecting(this, this.wasConnected));

    // attempt to open web-socket connection
    this.ws = new WebSocket(url);

    // handle open event
    this.ws.onopen = event => {
      this.log.info("established web-socket connection");

      this.wasConnected = true;

      // update state
      this.setState(WebSocketState.CONNECTED);

      // notify the listeners
      this.listeners.forEach(listener => listener.onOpen(this, event));
    };

    // handle close event
    this.ws.onclose = event => {
      const logDetails = `code: ${event.code}, reason: ${event.reason}, was clean: ${event.wasClean ? "yes" : "no"}`;

      if (this.wasConnected) {
        this.log.warn(`connection to web-socket was lost (${logDetails})`);
      } else {
        this.log.warn(`connecting to web-socket failed (${logDetails})`);
      }

      // update state
      this.setState(WebSocketState.DISCONNECTED);

      // attempt to reconnect
      setTimeout(() => {
        this.ws = this.connect(url);
      }, this.options.reconnectInterval);

      // notify the listeners
      this.listeners.forEach(listener => listener.onClose(this, event, this.wasConnected));
    };

    // handle error event
    this.ws.onerror = event => {
      this.log.warn(`got web-socket error`);

      // notify the listeners
      this.listeners.forEach(listener => listener.onError(this, event, this.wasConnected));
    };

    // handle message event
    this.ws.onmessage = event => {
      // notify the listeners
      this.listeners.forEach(listener => listener.onMessage(this, event.data));
    };

    return this.ws;
  }
}
