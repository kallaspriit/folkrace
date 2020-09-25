import { useMemo } from "react";
import { useHandleAttitudeCommand } from "../handlers/useHandleAttitudeCommand";
import { useHandleButtonCommand } from "../handlers/useHandleButtonCommand";
import { useHandleCurrentCommand } from "../handlers/useHandleCurrentCommand";
import { useHandleEncoderCommand } from "../handlers/useHandleEncoderCommand";
import { useHandleHeartbeatCommand } from "../handlers/useHandleHeartbeatCommand";
import { useHandleIpCommand } from "../handlers/useHandleIpCommand";
import { useHandleLidarMeasurementCommand } from "../handlers/useHandleLidarMeasurementCommand";
import { useHandleLidarStateCommand } from "../handlers/useHandleLidarStateCommand";
import { useHandleMotorsCommand } from "../handlers/useHandleMotorsCommand";
import { useHandleResetCommand } from "../handlers/useHandleResetCommand";
import { useHandleSerialStatusCommand } from "../handlers/useHandleSerialCommand";
import { useHandleTargetSpeedCommand } from "../handlers/useHandleTargetSpeedCommand";
import { useHandleUsbCommand } from "../handlers/useHandleUsbCommand";
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
  const handleTargetSpeedCommand = useHandleTargetSpeedCommand();
  const handleLidarStateCommand = useHandleLidarStateCommand();
  const handleLidarMeasurementCommand = useHandleLidarMeasurementCommand();
  const handleSerialStatusCommand = useHandleSerialStatusCommand();
  const handleMotorsCommand = useHandleMotorsCommand();
  const handleIpCommand = useHandleIpCommand();
  const handleResetCommand = useHandleResetCommand();
  const handleUsbCommand = useHandleUsbCommand();

  // map of command names to handlers
  const handlerMap: Record<string, CommandHandlerFn | undefined> = useMemo(
    () => ({
      h: handleHeartbeatCommand,
      a: handleAttitudeCommand,
      e: handleEncoderCommand,
      c: handleCurrentCommand,
      v: handleVoltageCommand,
      b: handleButtonCommand,
      t: handleTargetSpeedCommand,
      l: handleLidarStateCommand,
      m: handleLidarMeasurementCommand,
      serial: handleSerialStatusCommand,
      motors: handleMotorsCommand,
      ip: handleIpCommand,
      reset: handleResetCommand,
      usb: handleUsbCommand,
      // TODO: implement "rpm:300"
    }),
    [
      handleHeartbeatCommand,
      handleAttitudeCommand,
      handleEncoderCommand,
      handleCurrentCommand,
      handleVoltageCommand,
      handleButtonCommand,
      handleTargetSpeedCommand,
      handleLidarStateCommand,
      handleLidarMeasurementCommand,
      handleSerialStatusCommand,
      handleMotorsCommand,
      handleIpCommand,
      handleResetCommand,
      handleUsbCommand,
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
