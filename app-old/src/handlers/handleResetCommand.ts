import { ContainerMap } from "../services/containers";

export function handleResetCommand(_args: string[], { status }: ContainerMap) {
  void status.setResetReceived();
}
