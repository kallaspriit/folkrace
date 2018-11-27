import { ContainerMap } from "../components/ConnectionManager";

export default function handleMeasurementCommand(
  args: string[],
  { lidarContainer }: ContainerMap
) {
  // console.log("measurement", { args });
  lidarContainer.addMeasurement({
    angle: parseInt(args[0], 10),
    distance: parseInt(args[1], 10),
    quality: parseInt(args[2], 10),
    date: new Date()
  });
}
