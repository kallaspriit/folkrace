import { ContainerMap } from "../services/containers";

export function handleCurrentCommand(args: string[], { robot }: ContainerMap) {
  // currents are given in 10ma increments (so 1253 is 12.53A)
  const left = parseInt(args[0], 10) / 100.0;
  const right = parseInt(args[1], 10) / 100.0;

  void robot.setCurrent(left, right);
}
