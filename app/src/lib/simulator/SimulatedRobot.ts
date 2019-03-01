import { dummyLogger, Logger } from "ts-log";

import { SerialState, SerialType } from "../../containers/StatusContainer";

export interface SimulatedRobotOptions {
  readonly log?: Logger;
}

export type MessageListenerFn = (message: string) => void;

/*
Messages to handle:
1. voltage > [1]
2. s:M1:M2 > [2]
3. rpm:RPM > [3]
4. lidar > [4]
5. current > [5]
6. ping > [6]
7. state > [7.left,7.right,7.start,2,4,1,5,8]
8. proxy:CMD

Messages to report:
1. voltage:VOLTAGE
2. s:M1:M2
3. rpm:RPM
4. lidar:RUNNING:VALID:TARGET_RPM:CURRENT_RPM:MOTOR_PWM
5. current:CURRENT_M1:CURRENT_M2:VALID
6. pong
7. button:NAME:STATE
8: e:M1:M2 (encoder values)
9. reset
10: l:ANGLE1:DISTANCE1:QUALITY1:ANGLE2:DISTANCE2:QUALITY2:ANGLE3:DISTANCE3:QUALITY3:ANGLE4:DISTANCE4:QUALITY4
11: serial:SerialType:SerialState
*/

export enum Command {
  HANDSHAKE = "!handshake",
  VOLTAGE = "voltage",
  SPEED = "s",
  RPM = "rpm",
  CURRENT = "current",
  PING = "ping",
  STATE = "state",
  PROXY = "proxy",
  LIDAR = "lidar",
  PONG = "pong",
  BUTTON = "button",
  E = "e",
  RESET = "reset",
  L = "l",
  SERIAL = "serial",
}

export interface ButtonStateMap {
  left: number;
  right: number;
  start: number;
}

export interface MotorValue {
  left: number;
  right: number;
}

export class SimulatedRobot {
  private readonly options: Required<SimulatedRobotOptions>;
  private readonly log: Logger;
  private readonly messageListeners: MessageListenerFn[] = [];
  private readonly buttonStates: ButtonStateMap = { left: 1, right: 1, start: 1 };
  private readonly targetSpeeds: MotorValue = { left: 0, right: 0 };
  private readonly currents: MotorValue = { left: 0, right: 0 };
  private readonly encoderValues: MotorValue = { left: 0, right: 0 };

  constructor(options: SimulatedRobotOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.log = this.options.log;
  }

  addMessageListener(listener: MessageListenerFn) {
    this.messageListeners.push(listener);

    this.reportVoltage();
  }

  send(message: string) {
    // make it async
    setImmediate(() => {
      this.messageListeners.forEach(messageListener => messageListener(message));
    });
  }

  receive(message: string) {
    const [command, ...args] = message.split(":") as [Command, string[]];

    switch (command) {
      case Command.HANDSHAKE:
        this.reportHandshake();
        break;

      case Command.STATE:
        this.reportState();
        break;

      case Command.VOLTAGE:
        this.reportVoltage();
        break;

      default:
        this.log.warn(`missing handler for "${message}"`);

        return;
    }

    this.log.info(`handled command "${message}"`);
  }

  private reportHandshake() {
    // respond to handshake
    this.send("!handshake");

    // also fake connected USB serial
    this.send(`serial:${SerialType.USB}:${SerialState.CONNECTED}`);

    // also send initial state
    // this.reportVoltage();
  }

  private reportState() {
    this.reportButtonStates();
    this.reportTargetSpeed();
    this.reportLidarState();
    this.reportVoltage();
    this.reportCurrent();
    this.reportEncoderValues();
  }

  private reportVoltage() {
    this.send("voltage:15.9");
  }

  private reportButtonState(button: keyof ButtonStateMap) {
    this.send(`button:${button}:${this.buttonStates[button]}`);
  }

  private reportButtonStates() {
    this.reportButtonState("left");
    this.reportButtonState("right");
    this.reportButtonState("start");
  }

  private reportTargetSpeed() {
    this.send(`s:${this.targetSpeeds.left}:${this.targetSpeeds.right}`);
  }

  private reportLidarState() {
    // TODO: report actualy simulated lidar state
    this.send("lidar:0:0:0:0:0");
  }

  private reportCurrent() {
    this.send(`current:${this.currents.left}:${this.currents.right}`);
  }

  private reportEncoderValues() {
    this.send(`e:${this.encoderValues.left}:${this.encoderValues.right}`);
  }
}
