import { ContainerMap } from "../components/Router";

export function handleResetCommand(
  _args: string[],
  { statusContainer }: ContainerMap
) {
  statusContainer.setResetReceived();
}
