import { ContainerMap } from "../components/Router";

export function handleEncoderCommand(
  args: string[],
  { odometry }: ContainerMap
) {
  const left = parseInt(args[0], 10);
  const right = parseInt(args[1], 10);

  void odometry.update(left, right);
}
