import { ContainerMap } from "../components/Router";

export function handleVoltageCommand(args: string[], { status }: ContainerMap) {
  const voltage = parseFloat(args[0]);

  status.setBatteryVoltage(voltage);
}
