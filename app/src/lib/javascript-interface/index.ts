import { log } from "../../services/log";

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

export class JavascriptInterface {
  isAvailable: boolean;
  private robot: RobotJavascriptInterface;

  constructor() {
    // default to using mock interface if not available
    if (window.robot === undefined) {
      console.log("no javascript interface is available");

      this.robot = new MockJavascriptInterface();
      this.isAvailable = false;

      return;
    }

    // use the actual interface
    this.robot = window.robot;
    this.isAvailable = true;

    // setup robot to app interface
    window.app = {
      receive: message => this.onMessageReceived(message)
    };
  }

  send(message: string) {
    this.robot.receive(message);
  }

  private onMessageReceived(message: string) {
    log(`# received "${message}"`);
  }
}
