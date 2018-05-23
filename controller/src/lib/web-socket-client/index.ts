import { ILogger, dummyLogger } from "ts-log";

export interface WebSocketClientListener {
  onOpen(event: Event): void;
  onClose(event: CloseEvent): void;
  onError(event: Event): void;
  onMessage(message: string): void;
}

export interface WebSocketClientOptions {
  host: string;
  port: number;
  useSSL?: boolean;
  log?: ILogger;
}

export default class WebSocketClient {
  private listeners: WebSocketClientListener[] = [];
  private ws: WebSocket;
  private options: Required<WebSocketClientOptions>;
  private log: ILogger;

  public constructor(options: WebSocketClientOptions) {
    this.options = {
      useSSL: false,
      log: dummyLogger,
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

  private connect(url: string): WebSocket {
    this.log.info(`connecting to web-socket server at ${url}`);

    this.ws = new WebSocket(url);

    let wasConnected = false;

    this.ws.onopen = event => {
      this.log.info("established web-socket connection");

      wasConnected = true;

      // notify the listeners
      this.listeners.forEach(listener => listener.onOpen(event));
    };

    this.ws.onclose = event => {
      const logDetails = `code: ${event.code}, reason: ${event.reason}, was clean: ${event.wasClean ? "yes" : "no"}`;

      if (wasConnected) {
        this.log.warn(`connection to web-socket was lost (${logDetails})`);
      } else {
        this.log.warn(`connecting to web-socket failed (${logDetails})`);
      }

      // attempt to reconnect
      setTimeout(() => {
        this.ws = this.connect(url);
      }, 1000);

      // notify the listeners
      this.listeners.forEach(listener => listener.onClose(event));
    };

    this.ws.onerror = event => {
      this.log.warn(`got web-socket error`);

      // notify the listeners
      this.listeners.forEach(listener => listener.onError(event));
    };

    this.ws.onmessage = event => {
      // notify the listeners
      this.listeners.forEach(listener => listener.onMessage(event.data));
    };

    return this.ws;
  }
}
