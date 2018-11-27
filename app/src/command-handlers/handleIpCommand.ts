import { ContainerMap } from "../components/Router";

export default function handleIpCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  const remoteIp = args[0];

  statusContainer.setRemoteIp(remoteIp);
}
