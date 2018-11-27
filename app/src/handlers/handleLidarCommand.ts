import { ContainerMap } from "../components/Router";

export function handleLidarCommand(
  args: string[],
  { lidarContainer }: ContainerMap
) {
  const isStarted = parseInt(args[0], 10) === 1;
  const isValid = parseInt(args[1], 10) === 1;
  const targetRpm = parseFloat(args[2]);
  const currentRpm = parseFloat(args[3]);
  const motorPwm = parseFloat(args[4]);

  lidarContainer.updateLidarState({
    isStarted,
    isValid,
    targetRpm,
    currentRpm,
    motorPwm
  });
}
