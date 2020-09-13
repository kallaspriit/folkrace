import { ContainerMap } from "../services/containers";

export function handleAhrsCommand(args: string[], { ahrs }: ContainerMap) {
  // console.log("measurement", { args });
  void ahrs.setAttitude({
    roll: parseFloat(args[0]),
    pitch: parseFloat(args[1]),
    yaw: parseFloat(args[2]),
  });
}
