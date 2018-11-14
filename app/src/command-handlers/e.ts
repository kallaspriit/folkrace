import { ContainerMap } from "../components/glue/ConnectionManager";

export default function handleECommand(
  args: string[],
  { odometryContainer }: ContainerMap
) {
  const left = parseInt(args[0], 10);
  const right = parseInt(args[1], 10);

  odometryContainer.update(left, right);
}
