import { ContainerMap } from "./";

export function handleResetCommand(_args: string[], { status }: ContainerMap) {
  void status.setResetReceived();
}
