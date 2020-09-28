import { TrackedVehicleKinematics, TrackedVehicleOptions } from "./TrackedVehicleKinematics";

const options: TrackedVehicleOptions = {
  trackWidth: 0.12, // meters
  maxSpeed: 1, // meters per second
  wheelDiameter: 0.039, // meters
};

it("correctly calculates whether two speeds are different", () => {
  expect(
    TrackedVehicleKinematics.isSpeedDifferent(
      {
        left: 0,
        right: 0,
      },
      {
        left: 0,
        right: 0,
      },
      0,
    ),
  ).toEqual(false);
});

it("calculates speed to rpm", () => {
  const kinematics = new TrackedVehicleKinematics(options);

  expect(kinematics.speedToRpm(0)).toBeCloseTo(0);
  expect(kinematics.speedToRpm(1)).toBeCloseTo(489.71);
  expect(kinematics.speedToRpm(1.5)).toBeCloseTo(734.56);
});

it("calculates speeds to rpms", () => {
  const kinematics = new TrackedVehicleKinematics(options);

  const rpms = kinematics.speedsToRpms({
    left: 1.0,
    right: 1.5,
  });

  expect(rpms.left).toBeCloseTo(489.71);
  expect(rpms.right).toBeCloseTo(734.56);
});

it("calculates rpm to speed", () => {
  const kinematics = new TrackedVehicleKinematics(options);

  expect(kinematics.rpmToSpeed(60)).toBeCloseTo(0.12);
  expect(kinematics.rpmToSpeed(500)).toBeCloseTo(1.02);
});

it("calculates rpms to speeds", () => {
  const kinematics = new TrackedVehicleKinematics(options);

  const speeds = kinematics.rpmsToSpeeds({
    left: 60,
    right: 500,
  });

  expect(speeds.left).toBeCloseTo(0.12);
  expect(speeds.right).toBeCloseTo(1.02);
});
