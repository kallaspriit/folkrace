export interface TrackedVehicleOptions {
  trackWidth: number;
  maxSpeed: number;
  wheelDiameter: number;
}

export interface MotorValue {
  readonly left: number;
  readonly right: number;
}

export interface Motion {
  velocity: {
    x: number;
    y: number;
  };
  omega: number;
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
    const maxRequestedSpeedMagnitude = Math.max(Math.abs(speed.left), Math.abs(speed.right));
    const normalizationFactor = Math.min(maxSpeed / maxRequestedSpeedMagnitude, 1.0);

    return {
      left: speed.left * normalizationFactor,
      right: speed.right * normalizationFactor,
    };
  }

  speedToRpm(speedMetersPerSecond: number) {
    const circumference = this.options.wheelDiameter * Math.PI;
    const rotationsPerSecond = speedMetersPerSecond / circumference;
    const rotationPerMinute = rotationsPerSecond * 60;

    return rotationPerMinute;
  }

  speedsToRpms(speedsMetersPerSecond: MotorValue): MotorValue {
    return {
      left: this.speedToRpm(speedsMetersPerSecond.left),
      right: this.speedToRpm(speedsMetersPerSecond.right),
    };
  }

  rpmToSpeed(rotationPerMinute: number) {
    const circumference = this.options.wheelDiameter * Math.PI;
    const rotationsPerSecond = rotationPerMinute / 60;
    const speedMetersPerSecond = rotationsPerSecond * circumference;

    return speedMetersPerSecond;
  }

  rpmsToSpeeds(rotationsPerMinute: MotorValue): MotorValue {
    return {
      left: this.rpmToSpeed(rotationsPerMinute.left),
      right: this.rpmToSpeed(rotationsPerMinute.right),
    };
  }

  // TODO: calculate actual kinematics
  motionToSpeeds(speed: number, omega: number): MotorValue {
    const speeds: MotorValue = {
      left: speed + omega,
      right: speed - omega,
    };

    return TrackedVehicleKinematics.getLimitedSpeed(speeds, this.options.maxSpeed);
  }

  /**
   * The local frame of the vehicle is assumed to have its origin on the center of the area defined by both tracks, and
   * its Y axis is aligned with the forward motion direction.
   *
   * Instantaneous Center of Rotation (ICR) of a vehicle, considered as a rigid body, is defined as the point in the
   * plane where the motion of the vehicle can be represented by a rotation and no translation occurs.
   *
   * @param trackRpms Rotational speeds of the tracks
   */
  calculateMotion(trackRpms: MotorValue): Motion {
    // TODO: convert encoder speeds to track speeds in meters per second
    // const motorSpeed = this.encoderToMotorSpeed(encoderSpeed);
    const trackSpeeds = this.rpmsToSpeeds(trackRpms);

    // TODO: this is not really true, only for perfect differential drive
    const icrY = 0;
    const icrXLeft = -this.options.trackWidth / 2;
    const icrXRight = this.options.trackWidth / 2;

    const velocityX = ((trackSpeeds.right - trackSpeeds.left) / (icrXRight - icrXLeft)) * icrY;
    const velocityY =
      (trackSpeeds.right + trackSpeeds.left) / 2 -
      ((trackSpeeds.right - trackSpeeds.left) / (icrXRight - icrXLeft)) * ((icrXRight + icrXLeft) / 2);
    const omega = (trackSpeeds.right - trackSpeeds.left) / (icrXRight - icrXLeft);

    console.log({
      trackRpms,
      trackSpeeds,
      velocityX,
      velocityY,
      omega,
    });

    // const velocityX =

    return {
      velocity: {
        x: velocityX,
        y: velocityY,
      },
      omega: omega,
    };
  }
}
