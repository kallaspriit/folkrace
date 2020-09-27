import { useCallback, useMemo } from "react";
import { useSetRecoilState } from "recoil";
import { Logger } from "ts-log";
import { assertUnreachable } from "../services/assertUnreachable";
import { logMessagesState, LogMessageType } from "../state/logMessagesState";

let logMessageCount = 0;

export interface ExtendedLogger extends Logger {
  send(message?: any, ...optionalParams: any[]): void;
  receive(message?: any, ...optionalParams: any[]): void;
}

export function useLog(): ExtendedLogger {
  const setLogMessagesState = useSetRecoilState(logMessagesState);

  // const log = useCallback(
  //   (type: LogMessageType, message: string, transportName?: string) => {
  //     // append log message
  //     setLogMessagesState((logMessages) => [
  //       ...logMessages,
  //       {
  //         index: logMessageCount++,
  //         type,
  //         message,
  //         timestamp: Date.now(),
  //         transportName,
  //       },
  //     ]);

  //     // also log to navigator console
  //     logToConsole(type, message, transportName);
  //   },
  //   [setLogMessagesState],
  // );

  const appendLogMessage = useCallback(
    (type: LogMessageType, args: unknown[]) => {
      const message = getLogMessage(args);

      setLogMessagesState((logMessages) => [
        ...logMessages,
        {
          index: logMessageCount++,
          type,
          message,
          timestamp: Date.now(),
        },
      ]);

      // also log to navigator console
      logToConsole(type, message, args.slice(1));
    },
    [setLogMessagesState],
  );

  const logger: ExtendedLogger = useMemo(
    () => ({
      trace(...args) {
        return appendLogMessage(LogMessageType.INFO, args);
      },
      debug(...args) {
        return appendLogMessage(LogMessageType.INFO, args);
      },
      info(...args) {
        return appendLogMessage(LogMessageType.INFO, args);
      },
      warn(...args) {
        return appendLogMessage(LogMessageType.WARN, args);
      },
      error(...args) {
        return appendLogMessage(LogMessageType.ERROR, args);
      },
      send(...args) {
        return appendLogMessage(LogMessageType.SEND, args);
      },
      receive(...args) {
        return appendLogMessage(LogMessageType.RECEIVE, args);
      },
    }),
    [appendLogMessage],
  );

  return logger;

  // adds log message to log messages state
  // return (type: LogMessageType, message: string, transportName?: string) => {
  //   // append log message
  //   setLogMessagesState((logMessages) => [
  //     ...logMessages,
  //     {
  //       type,
  //       message,
  //       transportName,
  //     },
  //   ]);

  //   // also log to navigator console
  //   logToConsole(type, message, transportName);
  // };
}

function getLogMessage(args: any[]): string {
  if (args.length === 0) {
    throw new Error("Logger expects log message as first argument");
  }

  const message = args[0];

  if (typeof message !== "string") {
    throw new Error("Expected first argument to logger to be a string message");
  }

  return message;
}

function logToConsole(type: LogMessageType, message: string, args: unknown[]) {
  switch (type) {
    case LogMessageType.INFO:
      console.log(message, ...args);
      break;

    case LogMessageType.WARN:
      console.warn(message, ...args);
      break;

    case LogMessageType.ERROR:
      console.error(message, ...args);
      break;

    case LogMessageType.RECEIVE:
      console.log(`< ${message}`, ...args);
      break;

    case LogMessageType.SEND:
      console.log(`> ${message}`, ...args);
      break;

    default:
      return assertUnreachable(type, `Unexpected log message type type "${type}" not handled, this should not happen`);
  }
}
