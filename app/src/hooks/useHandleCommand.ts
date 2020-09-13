import { useMemo } from "react";
import { useHandleBeaconCommand } from "../handlers/useHandleBeaconCommand";
import { useHandleVoltageCommand } from "../handlers/useHandleVoltageCommand";
import { LogMessageType } from "../state/logMessagesState";
import { useLog } from "./useLog";

type CommandHandlerFn = (args: string[]) => void;

export function useHandleCommand() {
  const handleVoltageCommand = useHandleVoltageCommand();
  const handleBeaconCommand = useHandleBeaconCommand();
  const log = useLog();

  // map of command names to handlers
  const handlerMap: Record<string, CommandHandlerFn | undefined> = useMemo(
    () => ({
      voltage: handleVoltageCommand,
      b: handleBeaconCommand,
    }),
    [handleBeaconCommand, handleVoltageCommand],
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
