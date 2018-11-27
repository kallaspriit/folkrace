import throttle from "lodash.throttle";
import { dummyLogger, Logger } from "ts-log";

import { WebSocketClient } from "../web-socket-client/index";
import {
  TrackedVehicleKinematics,
  TrackedVehicleOptions
} from "../tracked-vehicle-kinematics";
import robot from "../../services/robot";

export interface RemoteControllerOptions {
  webSocketClient: WebSocketClient;
  vehicle: TrackedVehicleOptions;
  log?: Logger;
}

export default class RemoteController {
  private readonly options: Required<RemoteControllerOptions>;
  private readonly kinematics: TrackedVehicleKinematics;
  private speed = 0;
  private omega = 0;
  private readonly scheduleUpdateMotorSpeeds: () => void;

  constructor(options: RemoteControllerOptions) {
    this.options = {
      log: dummyLogger,
      ...options
    };
    this.kinematics = new TrackedVehicleKinematics(this.options.vehicle);

    this.scheduleUpdateMotorSpeeds = throttle(
      () => this.updateMotorSpeeds(),
      this.options.vehicle.speedUpdateInterval
    );
  }

  setSpeed(speed: number) {
    this.speed = speed;

    this.scheduleUpdateMotorSpeeds();
  }

  setOmega(omega: number) {
    this.omega = omega;

    this.scheduleUpdateMotorSpeeds();
  }

  private updateMotorSpeeds() {
    const motorSpeeds = this.kinematics.calculateMotorSpeeds(
      this.speed,
      this.omega
    );
    const encoderSpeeds = this.kinematics.getEncoderSpeeds(motorSpeeds);

    // TODO: only send if sufficiently different from last sent values
    robot.setSpeed(encoderSpeeds.left, encoderSpeeds.right);
  }
}
