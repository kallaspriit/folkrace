import { ContainerMap } from "../services/containers";

export function handleVoltageCommand(args: string[], { status }: ContainerMap) {
  const voltage = parseFloat(args[0]);

  void status.setBatteryVoltage(voltage);
}
