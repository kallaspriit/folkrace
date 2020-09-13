import { ContainerMap } from "../services/containers";

export function handleMotorsCommand(args: string[], { status }: ContainerMap) {
  const isMotorsCommunicationWorking = parseInt(args[0], 10) === 1;

  void status.setIsMotorsCommunicationWorking(isMotorsCommunicationWorking);
}
