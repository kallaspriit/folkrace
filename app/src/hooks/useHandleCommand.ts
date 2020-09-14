import { useMemo } from "react";
import { useHandleAttitudeCommand } from "../handlers/useHandleAttitudeCommand";
import { useHandleBeaconCommand } from "../handlers/useHandleBeaconCommand";
import { useHandleButtonCommand } from "../handlers/useHandleButtonCommand";
import { useHandleCurrentCommand } from "../handlers/useHandleCurrentCommand";
import { useHandleEncoderCommand } from "../handlers/useHandleEncoderCommand";
import { useHandleSerialStatusCommand } from "../handlers/useHandleSerialCommand";
import { useHandleVoltageCommand } from "../handlers/useHandleVoltageCommand";
import { LogMessageType } from "../state/logMessagesState";
import { useLog } from "./useLog";

type CommandHandlerFn = (args: string[]) => void;

export function useHandleCommand() {
  const log = useLog();

  // command handlers
  const handleBeaconCommand = useHandleBeaconCommand();
  const handleAttitudeCommand = useHandleAttitudeCommand();
  const handleEncoderCommand = useHandleEncoderCommand();
  const handleVoltageCommand = useHandleVoltageCommand();
  const handleButtonCommand = useHandleButtonCommand();
  const handleCurrentCommand = useHandleCurrentCommand();
  const handleSerialStatusCommand = useHandleSerialStatusCommand();

  // map of command names to handlers
  const handlerMap: Record<string, CommandHandlerFn | undefined> = useMemo(
    () => ({
      b: handleBeaconCommand,
      a: handleAttitudeCommand,
      e: handleEncoderCommand,
      voltage: handleVoltageCommand,
      button: handleButtonCommand,
      current: handleCurrentCommand,
      serial: handleSerialStatusCommand,
    }),
    [
      handleBeaconCommand,
      handleAttitudeCommand,
      handleEncoderCommand,
      handleVoltageCommand,
      handleButtonCommand,
      handleCurrentCommand,
      handleSerialStatusCommand,
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
