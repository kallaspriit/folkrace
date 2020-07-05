import { ContainerMap } from "../services/containers";

import { handleAhrsCommand } from "./handleAhrsCommand";
import { handleBeaconCommand } from "./handleBeaconCommand";
import { handleButtonCommand } from "./handleButtonCommand";
import { handleCurrentCommand } from "./handleCurrentCommand";
import { handleEncoderCommand } from "./handleEncoderCommand";
import { handleVoltageCommand } from "./handleGetVoltageCommand";
import { handleIpCommand } from "./handleIpCommand";
import { handleLidarMeasurementCommand } from "./handleLidarMeasurementCommand";
import { handleLidarStateCommand } from "./handleLidarStateCommand";
import { handlePongCommand } from "./handlePongCommand";
import { handleResetCommand } from "./handleResetCommand";
import { handleSerialCommand } from "./handleSerialCommand";
import { handleSpeedCommand } from "./handleSpeedCommand";
import { handleUsbCommand } from "./handleUsbCommand";

export type CommandHandlerFn = (
  args: string[],
  containers: ContainerMap
) => void;

export interface CommandHandlersMap {
  [x: string]: CommandHandlerFn | undefined;
}

export const commandHandlers: CommandHandlersMap = {
  serial: handleSerialCommand,
  ip: handleIpCommand,
  usb: handleUsbCommand,
  voltage: handleVoltageCommand,
  button: handleButtonCommand,
  reset: handleResetCommand,
  current: handleCurrentCommand,
  lidar: handleLidarStateCommand,
  pong: handlePongCommand,
  e: handleEncoderCommand,
  b: handleBeaconCommand,
  l: handleLidarMeasurementCommand,
  s: handleSpeedCommand,
  a: handleAhrsCommand,
};

// handles parsed web-socket commands
export function handleCommand(
  name: string,
  args: string[],
  containers: ContainerMap
) {
  const handler = commandHandlers[name];

  // check whether the handler exists
  if (handler === undefined) {
    console.warn(
      `missing web-socket command handler for "${name}" (${args.join(", ")})`
    );

    return;
  }

  // call the handler
  handler(args, containers);
}
