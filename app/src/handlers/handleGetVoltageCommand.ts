import { ContainerMap } from "../components/Router";

export function handleVoltageCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  const voltage = parseFloat(args[0]);

  statusContainer.setBatteryVoltage(voltage);
}
