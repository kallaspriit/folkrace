import { ContainerMap } from "../services/containers";

export function handleVoltageCommand(args: string[], { status }: ContainerMap) {
  // voltage is reported in 10ths of voltage (so 162 is 16.2 volts)
  const voltage = parseInt(args[0], 10) / 10.0;

  void status.setBatteryVoltage(voltage);
}
