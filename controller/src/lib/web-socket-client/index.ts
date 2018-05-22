let i = 0;

export interface WebSocketClientListener {
  onMessage(message: string): void;
}

export default class WebSocketClient {
  private listeners: WebSocketClientListener[] = [];

  public constructor() {
    // TODO: remove fake source
    setInterval(() => {
      this.publish(`test ${i++}`);
    }, 100);
  }

  public addListener(listener: WebSocketClientListener) {
    this.listeners.push(listener);
  }

  private publish(message: string) {
    this.listeners.forEach(listener => listener.onMessage(message));
  }
}
