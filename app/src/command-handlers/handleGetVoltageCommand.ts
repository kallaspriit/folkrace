import { ContainerMap } from "../components/Router";

export default function handleGetVoltageCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  const voltage = parseFloat(args[0]);

  statusContainer.setBatteryVoltage(voltage);
}
