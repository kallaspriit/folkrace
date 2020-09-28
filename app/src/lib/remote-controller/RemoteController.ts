import throttle from "lodash.throttle";
import { dummyLogger, Logger } from "ts-log";

import { Robot } from "../robot";
import { MotorValue, TrackedVehicleKinematics, TrackedVehicleOptions } from "../tracked-vehicle-kinematics";

export interface RemoteControlVehicleOptions extends TrackedVehicleOptions {
  speedUpdateInterval: number;
}

export interface RemoteControllerOptions {
  robot: Robot;
  vehicleOptions: RemoteControlVehicleOptions;
  log?: Logger;
}

export class RemoteController {
  private readonly options: Required<RemoteControllerOptions>;
  private readonly kinematics: TrackedVehicleKinematics;
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
    this.kinematics = new TrackedVehicleKinematics(this.options.vehicleOptions);

    this.scheduleUpdateMotorSpeeds = throttle(
      () => this.updateMotorSpeeds(),
      this.options.vehicleOptions.speedUpdateInterval,
    );

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
    const motorSpeeds = this.kinematics.motionToSpeed(this.speed, this.omega);
    // const encoderSpeeds = this.kinematics.motorToEncoderSpeed(motorSpeeds);
    const motorRpms = this.kinematics.speedsToRpms(motorSpeeds);

    // only send the speed if different from last
    if (!this.lastSentTargetRpms || TrackedVehicleKinematics.isSpeedDifferent(motorRpms, this.lastSentTargetRpms)) {
      this.robot.setMotorTargetRpms(motorRpms);

      this.lastSentTargetRpms = motorRpms;
    }
  }
}
