import { ContainerMap } from ".";

export function handleLidarMeasurementCommand(
  args: string[],
  { measurements }: ContainerMap
) {
  // console.log("measurement", { args });
  void measurements.add({
    angle: parseInt(args[0], 10),
    distance: parseInt(args[1], 10),
    quality: parseInt(args[2], 10),
    timestamp: Date.now()
  });
}
