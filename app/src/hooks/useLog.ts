import { useRecoilState } from "recoil";
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

    console.log(type, message, transportName);
  };
}
