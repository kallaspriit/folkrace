import { dummyLogger, Logger } from "ts-log";

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
*/

export class SimulatedRobot {
  private readonly options: Required<SimulatedRobotOptions>;
  private readonly log: Logger;
  private readonly messageListeners: MessageListenerFn[] = [];

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
    this.messageListeners.forEach(messageListener => messageListener(message));
  }

  receive(message: string) {
    this.log.info(`received "${message}"`);

    switch (message) {
      case "!handshake":
        this.reportHandshake();
        break;

      case "voltage":
        this.reportVoltage();
        break;
    }
  }

  private reportHandshake() {
    // respond to handshake
    this.send("!handshake");

    // also send initial state
    this.reportVoltage();
  }

  private reportVoltage() {
    this.send("voltage:15.9");
  }
}
