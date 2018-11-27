import { ContainerMap } from "../components/Router";

export function handleIpCommand(args: string[], { status }: ContainerMap) {
  const remoteIp = args[0];

  status.setRemoteIp(remoteIp);
}
