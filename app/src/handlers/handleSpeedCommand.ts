import { ContainerMap } from "../components/Router";

export function handleSpeedCommand(
  args: string[],
  { robotContainer }: ContainerMap
) {
  const left = parseInt(args[0], 10);
  const right = parseInt(args[1], 10);

  robotContainer.setTargetSpeed(left, right);
}
