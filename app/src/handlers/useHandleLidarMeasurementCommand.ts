import { useRecoilState, useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { lidarMeasurementsState, LidarMeasurement } from "../state/lidarMeasurementsState";

const maxMeasurementCount = 360;

export function useHandleLidarMeasurementCommand() {
  // const [existingLidarMeasurements, setLidarMeasurements] = useRecoilState(lidarMeasurementsState);
  const setLidarMeasurements = useSetRecoilState(lidarMeasurementsState);

  // for example "m:a1:a2:a3:b1:b2:b3:d1:d2:d3:e1:e2:e3" means four measurements with angle, distance, quality
  return (args: string[]) => {
    assertArgumentCount(args, 12);

    const receivedMeasurements: LidarMeasurement[] = [];

    // add received measurements
    for (let i = 0; i < 4; i++) {
      receivedMeasurements.push({
        angle: parseInt(args[0 + i * 3], 10),
        distance: parseInt(args[1 + i * 3], 10),
        quality: parseInt(args[2 + i * 3], 10),
        timestamp: Date.now(),
      });
    }

    // update measurements
    setLidarMeasurements((existingLidarMeasurements) => {
      const excessiveMeasurementCount = Math.max(
        existingLidarMeasurements.length + receivedMeasurements.length - 360,
        0,
      );

      const newMeasurements = [...existingLidarMeasurements.slice(excessiveMeasurementCount), ...receivedMeasurements];

      // sanity check
      if (newMeasurements.length > maxMeasurementCount) {
        throw new Error(
          `Expected not to accumulate more than ${maxMeasurementCount} measurements but got ${newMeasurements.length}, this should not happen`,
        );
      }

      return newMeasurements;
    });
  };
}
