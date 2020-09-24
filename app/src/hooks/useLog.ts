import { useCallback } from "react";
import { useSetRecoilState } from "recoil";
import { assertUnreachable } from "../services/assertUnreachable";
import { logMessagesState, LogMessageType } from "../state/logMessagesState";

let logMessageCount = 0;

export function useLog() {
  const setLogMessagesState = useSetRecoilState(logMessagesState);

  const log = useCallback(
    (type: LogMessageType, message: string, transportName?: string) => {
      // append log message
      setLogMessagesState((logMessages) => [
        ...logMessages,
        {
          index: logMessageCount++,
          type,
          message,
          timestamp: Date.now(),
          transportName,
        },
      ]);

      // also log to navigator console
      logToConsole(type, message, transportName);
    },
    [setLogMessagesState],
  );

  return log;

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

function logToConsole(type: LogMessageType, message: string, _transportName?: string) {
  switch (type) {
    case LogMessageType.INFO:
      console.log(message);
      break;

    case LogMessageType.WARN:
      console.warn(message);
      break;

    case LogMessageType.ERROR:
      console.error(message);
      break;

    case LogMessageType.RECEIVE:
      console.log(`< ${message}`);
      break;

    case LogMessageType.SEND:
      console.log(`> ${message}`);
      break;

    default:
      return assertUnreachable(type, `Unexpected log message type type "${type}" not handled, this should not happen`);
  }
}
