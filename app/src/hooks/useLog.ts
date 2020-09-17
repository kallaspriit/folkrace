import { useRecoilState } from "recoil";
import { assertUnreachable } from "../services/assertUnreachable";
import { logMessagesState, LogMessageType } from "../state/logMessagesState";

export function useLog() {
  const [logMessages, setLogMessages] = useRecoilState(logMessagesState);

  // adds log message to log messages state
  return (type: LogMessageType, message: string, transportName?: string) => {
    setLogMessages([
      ...logMessages,
      {
        type,
        message,
        transportName,
      },
    ]);

    logToConsole(type, message, transportName);
  };
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
