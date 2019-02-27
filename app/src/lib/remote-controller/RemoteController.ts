import throttle from "lodash.throttle";
import { dummyLogger, Logger } from "ts-log";

import { Robot } from "../robot";
import { TrackedVehicleKinematics, TrackedVehicleOptions } from "../tracked-vehicle-kinematics";

export interface RemoteControllerOptions {
  robot: Robot;
  vehicle: TrackedVehicleOptions;
  log?: Logger;
}

export class RemoteController {
  private readonly options: Required<RemoteControllerOptions>;
  private readonly kinematics: TrackedVehicleKinematics;
  private readonly robot: Robot;
  private speed = 0;
  private omega = 0;
  private readonly scheduleUpdateMotorSpeeds: () => void;

  constructor(options: RemoteControllerOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.robot = this.options.robot;
    this.kinematics = new TrackedVehicleKinematics(this.options.vehicle);

    this.scheduleUpdateMotorSpeeds = throttle(() => this.updateMotorSpeeds(), this.options.vehicle.speedUpdateInterval);
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
    const motorSpeeds = this.kinematics.calculateMotorSpeeds(this.speed, this.omega);
    const encoderSpeeds = this.kinematics.getEncoderSpeeds(motorSpeeds);

    // TODO: only send if sufficiently different from last sent values
    this.robot.setSpeed(encoderSpeeds.left, encoderSpeeds.right);
  }
}
