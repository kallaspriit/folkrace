import { ContainerMap } from "../components/ConnectionManager";

export default function handleGetVoltageCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  const voltage = parseFloat(args[0]);

  statusContainer.setBatteryVoltage(voltage);
}
