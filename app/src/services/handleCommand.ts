// import { handleAhrsCommand } from "../handlers/handleAhrsCommand";
// import { handleBeaconCommand } from "../handlers/handleBeaconCommand";
// import { handleButtonCommand } from "../handlers/handleButtonCommand";
// import { handleCurrentCommand } from "../handlers/handleCurrentCommand";
// import { handleEncoderCommand } from "../handlers/handleEncoderCommand";
// import { handleVoltageCommand } from "../handlers/handleVoltageCommand";
// import { handleIpCommand } from "../handlers/handleIpCommand";
// import { handleLidarMeasurementCommand } from "../handlers/handleLidarMeasurementCommand";
// import { handleLidarStateCommand } from "../handlers/handleLidarStateCommand";
// import { handleMotorsCommand } from "../handlers/handleMotorsCommand";
// import { handlePongCommand } from "../handlers/handlePongCommand";
// import { handleResetCommand } from "../handlers/handleResetCommand";
// import { handleSerialCommand } from "../handlers/handleSerialCommand";
// import { handleSpeedCommand } from "../handlers/handleSpeedCommand";
// import { handleUsbCommand } from "../handlers/handleUsbCommand";

export type CommandHandlerFn = (args: string[]) => void;

export interface CommandHandlersMap {
  [x: string]: CommandHandlerFn | undefined;
}

export const commandHandlers: CommandHandlersMap = {
  // serial: handleSerialCommand,
  // ip: handleIpCommand,
  // usb: handleUsbCommand,
  // voltage: handleVoltageCommand,
  // button: handleButtonCommand,
  // reset: handleResetCommand,
  // current: handleCurrentCommand,
  // lidar: handleLidarStateCommand,
  // pong: handlePongCommand,
  // motors: handleMotorsCommand,
  // e: handleEncoderCommand,
  // b: handleBeaconCommand,
  // l: handleLidarMeasurementCommand,
  // s: handleSpeedCommand,
  // a: handleAhrsCommand,
};

// handles parsed web-socket commands
export function handleCommand(name: string, args: string[]) {
  const handler = commandHandlers[name];

  // check whether the handler exists
  if (handler === undefined) {
    console.warn(`missing command handler for "${name}" (${args.join(", ")})`);

    return;
  }

  // call the handler
  handler(args);
}
