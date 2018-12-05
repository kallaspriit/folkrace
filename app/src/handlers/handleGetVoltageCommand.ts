import { ContainerMap } from "./";

export function handleVoltageCommand(args: string[], { status }: ContainerMap) {
  const voltage = parseFloat(args[0]);

  void status.setBatteryVoltage(voltage);
}
