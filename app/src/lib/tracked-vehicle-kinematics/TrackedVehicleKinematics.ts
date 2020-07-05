export interface TrackedVehicleOptions {
  trackWidth: number;
  maxSpeed: number;
  wheelDiameter: number;
  encoderCountsPerRotation: number;
  gearboxRatio: number;
  speedUpdateInterval: number;
}

export interface MotorValue {
  readonly left: number;
  readonly right: number;
}

export interface Motion {
  position: {
    x: number;
    y: number;
  };
  angle: number;
}

// https://pdfs.semanticscholar.org/29ae/0bc974737b58afd63b6edb8d0837a3383321.pdf
export class TrackedVehicleKinematics {
  constructor(private readonly options: TrackedVehicleOptions) {}

  static isSpeedDifferent(a: MotorValue, b: MotorValue, threshold = 0) {
    const leftDifference = Math.abs(a.left - b.left);
    const rightDifference = Math.abs(a.right - b.right);

    const isLeftDifferent = leftDifference <= threshold;
    const isRightDifferent = rightDifference <= threshold;

    return !isLeftDifferent && !isRightDifferent;
  }

  static getLimitedSpeed(speed: MotorValue, maxSpeed: number): MotorValue {
    const maxRequestedSpeedMagnitude = Math.max(
      Math.abs(speed.left),
      Math.abs(speed.right)
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
      left: speed.left * normalizationFactor,
      right: speed.right * normalizationFactor,
    };
  }

  getSpeedEncoderCount(speedMetersPerSecond: number) {
    const circumference = this.options.wheelDiameter * Math.PI;
    const gearedEncoderCountsPerRevolution =
      this.options.encoderCountsPerRotation * this.options.gearboxRatio;
    const rotationsPerSecond = speedMetersPerSecond / circumference;
    const targetEncoderCountPerSecond =
      rotationsPerSecond * gearedEncoderCountsPerRevolution;

    return Math.floor(targetEncoderCountPerSecond);
  }

  getEncoderCountSpeed(encoderCountsPerSecond: number) {
    const circumference = this.options.wheelDiameter * Math.PI;
    const gearedEncoderCountsPerRevolution =
      this.options.encoderCountsPerRotation * this.options.gearboxRatio;

    const revolutionsPerSecond =
      encoderCountsPerSecond / gearedEncoderCountsPerRevolution;
    const speed = revolutionsPerSecond / circumference;

    return speed;
  }

  motorToEncoderSpeed(motorSpeed: MotorValue): MotorValue {
    return {
      left: this.getSpeedEncoderCount(motorSpeed.left),
      right: this.getSpeedEncoderCount(motorSpeed.right),
    };
  }

  encoderToMotorSpeed(encoderSpeed: MotorValue): MotorValue {
    return {
      left: this.getEncoderCountSpeed(encoderSpeed.left),
      right: this.getEncoderCountSpeed(encoderSpeed.right),
    };
  }

  motionToSpeed(speed: number, omega: number): MotorValue {
    // TODO: calculate actual kinematics
    const speeds: MotorValue = {
      left: speed + omega,
      right: speed - omega,
    };

    return TrackedVehicleKinematics.getLimitedSpeed(
      speeds,
      this.options.maxSpeed
    );
  }

  speedToMotion(encoderSpeed: MotorValue): Motion {
    // TODO: convert encoder speeds to track speeds in meters per second
    // const motorSpeed = this.encoderToMotorSpeed(encoderSpeed);

    return {
      position: {
        x: 0,
        y: 0,
      },
      angle: 0,
    };
  }
}
