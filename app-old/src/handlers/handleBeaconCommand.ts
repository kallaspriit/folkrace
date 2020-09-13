import { ContainerMap } from "../services/containers";

export function handleBeaconCommand(args: string[], { status }: ContainerMap) {
  const durationMs = parseInt(args[0], 10);
  const cycleCount = parseInt(args[1], 10);
  const loadPercentage = parseInt(args[2], 10);
  const loopFrequency = (cycleCount / durationMs) * 1000;
  const loopTimeUs = (durationMs / cycleCount) * 1000;

  void status.setLoopStatistics(loopFrequency, loopTimeUs, loadPercentage);
}
