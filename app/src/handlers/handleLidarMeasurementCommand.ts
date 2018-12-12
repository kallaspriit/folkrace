import { ContainerMap } from "../services/containers";

export function handleLidarMeasurementCommand(
  args: string[],
  { measurements }: ContainerMap
) {
  // the command includes 4 measurements
  for (let i = 0; i < 4; i++) {
    void measurements.add({
      angle: parseInt(args[0 + i * 3], 10),
      distance: parseInt(args[1 + i * 3], 10),
      quality: parseInt(args[2 + i * 3], 10),
      timestamp: Date.now()
    });
  }
}
