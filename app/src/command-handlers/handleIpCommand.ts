import { ContainerMap } from "../components/glue/ConnectionManager";

export default function handleIpCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  const remoteIp = args[0];

  statusContainer.setRemoteIp(remoteIp);
}