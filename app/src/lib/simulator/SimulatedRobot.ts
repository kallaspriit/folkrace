import { dummyLogger, Logger } from "ts-log";

import { config } from "../../config";
import { SerialState, SerialType } from "../../containers/StatusContainer";
import { Ticker, TickInfo } from "../ticker";
import { TrackedVehicleKinematics } from "../tracked-vehicle-kinematics";
import { CartesianCoordinates } from "../visualizer";

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
  LIDAR_STATE = "lidar",
  PONG = "pong",
  BUTTON = "button",
  ENCODER = "e",
  RESET = "reset",
  LIDAR_MEASUREMENT = "l",
  SERIAL = "serial",
}

export interface ButtonStates {
  readonly left: number;
  readonly right: number;
  readonly start: number;
}

export interface MotorValue {
  readonly left: number;
  readonly right: number;
}

export class SimulatedRobot {
  location: CartesianCoordinates = { x: 0, y: 0 };
  speed: MotorValue = { left: 0, right: 0 };
  angle = 0;

  private readonly options: Required<SimulatedRobotOptions>;
  private readonly log: Logger;
  private readonly kinematics: TrackedVehicleKinematics;
  private readonly ticker: Ticker;
  private readonly messageListeners: MessageListenerFn[] = [];
  private buttonStates: ButtonStates = { left: 1, right: 1, start: 1 };
  private current: MotorValue = { left: 0, right: 0 };
  private encoderValues: MotorValue = { left: 0, right: 0 };
  private targetSpeed: MotorValue = { left: 0, right: 0 };

  constructor(options: SimulatedRobotOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.log = this.options.log;

    // setup kinematics
    this.kinematics = new TrackedVehicleKinematics(config.vehicle);

    // setup ticker
    this.ticker = new Ticker({
      tick: this.tick.bind(this),
    });

    // TODO: don't run unless simulated transport is used
    this.ticker.start();
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
    const [command, ...args] = message.split(":");

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

      case Command.SPEED:
        this.setSpeed({ left: parseFloat(args[0]), right: parseFloat(args[1]) });
        break;

      default:
        this.log.warn(`missing handler for "${message}"`);

        return;
    }

    this.log.info(`handled command "${message}"`);
  }

  setSpeed(speed: MotorValue) {
    this.targetSpeed = speed;
  }

  private tick(info: TickInfo) {
    this.tickLocation(info);
  }

  private tickLocation({ dt }: TickInfo) {
    // TODO: apply realistic acceleration
    this.speed = this.targetSpeed;

    this.encoderValues = {
      left: this.speed.left * dt,
      right: this.speed.right * dt,
    };
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

  private reportButtonState(button: keyof ButtonStates) {
    this.send(`button:${button}:${this.buttonStates[button]}`);
  }

  private reportButtonStates() {
    this.reportButtonState("left");
    this.reportButtonState("right");
    this.reportButtonState("start");
  }

  private reportTargetSpeed() {
    this.send(`s:${this.targetSpeed.left}:${this.targetSpeed.right}`);
  }

  private reportLidarState() {
    // TODO: report actualy simulated lidar state
    this.send("lidar:0:0:0:0:0");
  }

  private reportCurrent() {
    this.send(`current:${this.current.left}:${this.current.right}`);
  }

  private reportEncoderValues() {
    this.send(`e:${this.encoderValues.left}:${this.encoderValues.right}`);
  }
}
