import { log } from "../../services/log";
import { Transport, TransportListener } from "../transport";

interface RobotJavascriptInterface {
  receive(message: string): void;
}

interface AppJavascriptInterface {
  receive(message: string): void;
}

// extend the global window interface
declare global {
  interface Window {
    robot?: RobotJavascriptInterface;
    app?: AppJavascriptInterface;
  }
}

export class MockJavascriptInterface implements RobotJavascriptInterface {
  receive(message: string) {
    console.log("MockJavascriptInterface", "receive", message);
  }
}

export class JavascriptInterface implements Transport {
  isAvailable: boolean;
  private robot: RobotJavascriptInterface;
  private listeners: TransportListener[] = [];

  constructor() {
    // notify of connecting event
    this.listeners.forEach(listener => listener.onConnecting());

    // default to using mock interface if not available
    if (window.robot === undefined) {
      console.log("no javascript interface is available");

      this.robot = new MockJavascriptInterface();
      this.isAvailable = false;

      // notify of open event
      this.listeners.forEach(listener => listener.onClose());

      return;
    }

    // use the actual interface
    this.robot = window.robot;
    this.isAvailable = true;

    // setup robot to app interface
    window.app = {
      receive: message => this.onMessageReceived(message)
    };

    // notify of open event
    this.listeners.forEach(listener => listener.onOpen());
  }

  addListener(listener: TransportListener) {
    this.listeners.push(listener);
  }

  send(message: string) {
    try {
      this.robot.receive(message);

      this.listeners.forEach(listener => listener.onMessageSent(message));
    } catch (error) {
      this.listeners.forEach(listener => listener.onError(error));
    }
  }

  private onMessageReceived(message: string) {
    log(`# received "${message}"`);

    this.listeners.forEach(listener => listener.onMessageReceived(message));
  }
}
