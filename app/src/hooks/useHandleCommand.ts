import { useMemo } from "react";
import { useHandleAttitudeCommand } from "../handlers/useHandleAttitudeCommand";
import { useHandleBeaconCommand } from "../handlers/useHandleBeaconCommand";
import { useHandleButtonCommand } from "../handlers/useHandleButtonCommand";
import { useHandleCurrentCommand } from "../handlers/useHandleCurrentCommand";
import { useHandleVoltageCommand } from "../handlers/useHandleVoltageCommand";
import { LogMessageType } from "../state/logMessagesState";
import { useLog } from "./useLog";

type CommandHandlerFn = (args: string[]) => void;

export function useHandleCommand() {
  const handleBeaconCommand = useHandleBeaconCommand();
  const handleAttitudeCommand = useHandleAttitudeCommand();
  const handleVoltageCommand = useHandleVoltageCommand();
  const handleButtonCommand = useHandleButtonCommand();
  const handleCurrentCommand = useHandleCurrentCommand();
  const log = useLog();

  // map of command names to handlers
  const handlerMap: Record<string, CommandHandlerFn | undefined> = useMemo(
    () => ({
      b: handleBeaconCommand,
      a: handleAttitudeCommand,
      voltage: handleVoltageCommand,
      button: handleButtonCommand,
      current: handleCurrentCommand,
    }),
    [handleAttitudeCommand, handleBeaconCommand, handleButtonCommand, handleCurrentCommand, handleVoltageCommand],
  );

  return (command: string, args: string[]) => {
    const handler = handlerMap[command];

    if (!handler) {
      log(LogMessageType.WARN, `missing handler for command "${command}" (${args.join(", ")})`);

      return;
    }

    handler(args);
  };
}
