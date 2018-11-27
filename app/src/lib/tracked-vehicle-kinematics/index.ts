export interface TrackedVehicleOptions {
  trackWidth: number;
  maxSpeed: number;
  wheelDiameter: number;
  encoderCountsPerRotation: number;
  gearboxRatio: number;
  speedUpdateInterval: number;
}

export interface MotorSpeeds {
  left: number;
  right: number;
}

// https://pdfs.semanticscholar.org/29ae/0bc974737b58afd63b6edb8d0837a3383321.pdf
export class TrackedVehicleKinematics {
  constructor(private readonly options: TrackedVehicleOptions) {}

  /**
   * Returns motor speeds in m/s for requested forward speed at given rotational speed.
   *
   * @param speed Speed in m/s
   * @param omega Rotational speed in rad/s
   */
  calculateMotorSpeeds(speed: number, omega: number): MotorSpeeds {
    // TODO: calculate actual kinematics
    return this.limit(
      {
        left: speed + omega,
        right: speed - omega
      },
      this.options.maxSpeed
    );
  }

  getSpeedEncoderCount(speed: number) {
    const circumference = this.options.wheelDiameter * Math.PI;
    const rps = speed / circumference;
    const actualEncoderCountPerRevolution =
      this.options.encoderCountsPerRotation * this.options.gearboxRatio;
    const targetEncoderCountPerSecond = rps * actualEncoderCountPerRevolution;

    return Math.floor(targetEncoderCountPerSecond);
  }

  limit(speeds: MotorSpeeds, maxSpeed: number): MotorSpeeds {
    const maxRequestedSpeedMagnitude = Math.max(
      Math.abs(speeds.left),
      Math.abs(speeds.right)
    );
    const normalizationFactor = Math.min(
      maxSpeed / maxRequestedSpeedMagnitude,
      1.0
    );

    // console.log("normalize", {
    //   maxRequestedSpeedMagnitude,
    //   normalizationFactor,
    //   speeds,
    //   maxSpeed,
    // });

    return {
      left: speeds.left * normalizationFactor,
      right: speeds.right * normalizationFactor
    };
  }

  getEncoderSpeeds(speeds: MotorSpeeds): MotorSpeeds {
    return {
      left: this.getSpeedEncoderCount(speeds.left),
      right: this.getSpeedEncoderCount(speeds.right)
    };
  }
}
