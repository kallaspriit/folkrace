import { ContainerMap } from "../components/Router";

export function handleResetCommand(_args: string[], { status }: ContainerMap) {
  void status.setResetReceived();
}
