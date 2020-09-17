import { useMemo } from "react";
import { useHandleIpCommand } from "../handlers/handleIpCommand";
import { useHandleSpeedCommand } from "../handlers/handleSpeedCommand";
import { useHandleAttitudeCommand } from "../handlers/useHandleAttitudeCommand";
import { useHandleButtonCommand } from "../handlers/useHandleButtonCommand";
import { useHandleCurrentCommand } from "../handlers/useHandleCurrentCommand";
import { useHandleEncoderCommand } from "../handlers/useHandleEncoderCommand";
import { useHandleHeartbeatCommand } from "../handlers/useHandleHeartbeatCommand";
import { useHandleMotorsCommand } from "../handlers/useHandleMotorsCommand";
import { useHandleSerialStatusCommand } from "../handlers/useHandleSerialCommand";
import { useHandleVoltageCommand } from "../handlers/useHandleVoltageCommand";
import { LogMessageType } from "../state/logMessagesState";
import { useLog } from "./useLog";

type CommandHandlerFn = (args: string[]) => void;

export function useHandleCommand() {
  const log = useLog();

  // command handlers
  const handleHeartbeatCommand = useHandleHeartbeatCommand();
  const handleAttitudeCommand = useHandleAttitudeCommand();
  const handleEncoderCommand = useHandleEncoderCommand();
  const handleCurrentCommand = useHandleCurrentCommand();
  const handleVoltageCommand = useHandleVoltageCommand();
  const handleButtonCommand = useHandleButtonCommand();
  const handleSpeedCommand = useHandleSpeedCommand();
  const handleSerialStatusCommand = useHandleSerialStatusCommand();
  const handleMotorsCommand = useHandleMotorsCommand();
  const handleIpCommand = useHandleIpCommand();

  // map of command names to handlers
  const handlerMap: Record<string, CommandHandlerFn | undefined> = useMemo(
    () => ({
      h: handleHeartbeatCommand,
      a: handleAttitudeCommand,
      e: handleEncoderCommand,
      c: handleCurrentCommand,
      v: handleVoltageCommand,
      b: handleButtonCommand,
      s: handleSpeedCommand,
      serial: handleSerialStatusCommand,
      motors: handleMotorsCommand,
      ip: handleIpCommand,
    }),
    [
      handleHeartbeatCommand,
      handleAttitudeCommand,
      handleEncoderCommand,
      handleCurrentCommand,
      handleVoltageCommand,
      handleButtonCommand,
      handleSpeedCommand,
      handleSerialStatusCommand,
      handleMotorsCommand,
      handleIpCommand,
    ],
  );

  // return method that accepts command with arguments and forwards it to correct handler
  return (command: string, args: string[]) => {
    const handler = handlerMap[command];

    if (!handler) {
      log(LogMessageType.WARN, `missing handler for command "${command}" (${args.join(", ")})`);

      return;
    }

    handler(args);
  };
}
