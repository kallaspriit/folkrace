import { ContainerMap } from "./";

export function handleCurrentCommand(args: string[], { robot }: ContainerMap) {
  const left = parseInt(args[0], 10);
  const right = parseInt(args[1], 10);

  void robot.setCurrent(left, right);
}
