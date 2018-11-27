import { ContainerMap } from "../components/Router";

export function handleIpCommand(args: string[], { status }: ContainerMap) {
  const remoteIp = args[0];
  const isOffline = remoteIp === "null";

  if (!isOffline) {
    void status.setRemoteIp(remoteIp);
  } else {
    void status.setOffline();
  }
}
