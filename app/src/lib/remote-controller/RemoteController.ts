import throttle from "lodash.throttle";
import { dummyLogger, Logger } from "ts-log";

import { config } from "../../config";
import { kinematics } from "../../services/kinematics";
import { Robot } from "../robot";
import { MotorValue, TrackedVehicleKinematics } from "../tracked-vehicle-kinematics";

export interface RemoteControllerOptions {
  robot: Robot;
  log?: Logger;
}

export class RemoteController {
  private readonly options: Required<RemoteControllerOptions>;
  private readonly robot: Robot;
  private readonly scheduleUpdateMotorSpeeds: () => void;
  private speed = 0; // in m/s
  private omega = 0; // in rad/s
  private lastSentTargetRpms?: MotorValue;

  constructor(options: RemoteControllerOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.robot = this.options.robot;

    // throttle updating motor speeds
    this.scheduleUpdateMotorSpeeds = throttle(() => this.updateMotorSpeeds(), config.vehicle.speedUpdateInterval);

    // TODO: refactor as a separate controller for testing
    // experiments that fades between min/max speeds for testing communication
    // let range = 0.5;
    // let value = 0;
    // let step = 0.01;
    // let direction = 1;

    // setInterval(() => {
    //   value += step * direction;

    //   if (value > range) {
    //     value = range;
    //     direction *= -1;
    //   } else if (value < -range) {
    //     value = -range;
    //     direction *= -1;
    //   }

    //   this.speed = value;

    //   this.updateMotorSpeeds();
    // }, this.options.vehicle.speedUpdateInterval);
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
    const motorSpeeds = kinematics.motionToSpeeds(this.speed, this.omega);
    const motorRpms = kinematics.speedsToRpms(motorSpeeds);

    // only send the speed if different from last
    if (!this.lastSentTargetRpms || TrackedVehicleKinematics.isSpeedDifferent(motorRpms, this.lastSentTargetRpms)) {
      this.robot.setMotorTargetRpms(motorRpms);

      this.lastSentTargetRpms = motorRpms;
    }
  }
}
