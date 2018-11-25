import { ContainerMap } from "../components/glue/ConnectionManager";

export default function handleBeaconCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  statusContainer.updateLastBeaconTime();
}
