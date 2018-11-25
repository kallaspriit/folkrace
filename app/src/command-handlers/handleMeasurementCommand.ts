import { ContainerMap } from "../components/glue/ConnectionManager";

export default function handleMeasurementCommand(
  args: string[],
  { lidarContainer }: ContainerMap
) {
  console.log("measurement", { args });
}
