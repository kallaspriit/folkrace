import { ContainerMap } from "../components/Router";

export function handleSpeedCommand(
  args: string[],
  { odometryContainer }: ContainerMap
) {
  const left = parseInt(args[0], 10);
  const right = parseInt(args[1], 10);

  odometryContainer.setTargetSpeed(left, right);
}
