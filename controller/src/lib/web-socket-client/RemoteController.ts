import WebSocketClient from "./index";
import { dummyLogger, Logger } from "ts-log";
import TrackedVehicleKinematics, { TrackedVehicleOptions } from "./TrackedVehicleKinematics";
import { throttle } from "lodash";

export interface RemoteControllerOptions {
  webSocketClient: WebSocketClient;
  vehicle: TrackedVehicleOptions;
  log?: Logger;
}

export default class RemoteController {
  private options: Required<RemoteControllerOptions>;
  private kinematics: TrackedVehicleKinematics;
  private speed = 0;
  private omega = 0;
  private scheduleUpdateMotorSpeeds: () => void;

  public constructor(options: RemoteControllerOptions) {
    this.options = {
      log: dummyLogger,
      ...options,
    };
    this.kinematics = new TrackedVehicleKinematics(this.options.vehicle);

    this.scheduleUpdateMotorSpeeds = throttle(() => this.updateMotorSpeeds(), this.options.vehicle.speedUpdateInterval);
  }

  public setSpeed(speed: number) {
    this.speed = speed;

    this.scheduleUpdateMotorSpeeds();
  }

  public setOmega(omega: number) {
    this.omega = omega;

    this.scheduleUpdateMotorSpeeds();
  }

  private updateMotorSpeeds() {
    const motorSpeeds = this.kinematics.calculateMotorSpeeds(this.speed, this.omega);
    const encoderSpeeds = this.kinematics.getEncoderSpeeds(motorSpeeds);

    // TODO: only send if sufficiently different from last sent values
    this.options.webSocketClient.send(`set-speed:${encoderSpeeds.left}:${encoderSpeeds.right}`);
  }
}
