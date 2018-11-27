import { ContainerMap } from "../components/Router";

export function handleCurrentCommand(args: string[], { robot }: ContainerMap) {
  const left = parseInt(args[0], 10);
  const right = parseInt(args[1], 10);

  robot.setCurrent(left, right);
}
