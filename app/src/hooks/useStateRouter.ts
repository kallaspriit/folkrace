import { useRecoilState } from "recoil";
import { multiTransport } from "../services/multiTransport";
import { logMessagesState, LogMessageType } from "../state/logMessagesState";
import { transportStateState } from "../state/transportStateState";
import { useTransportListener } from "./useTransportListener";

// listens for events from multi-transport and forwards it to state
export function useStateRouter() {
  const [transportState, setTransportState] = useRecoilState(transportStateState);
  const [logMessages, setLogMessages] = useRecoilState(logMessagesState);

  // adds log message to log messages state
  const log = (type: LogMessageType, message: string, transportName?: string) => {
    setLogMessages([
      ...logMessages,
      {
        type,
        message,
        transportName,
      },
    ]);
  };

  const currentTransportState = multiTransport.getState();

  // set initial transport state
  if (transportState !== currentTransportState) {
    setTransportState(currentTransportState);
  }

  // adds new multi-transport listeners and forwards the events to state
  useTransportListener({
    // called when active transport state changes
    onStateChanged: (transport, newState, _previousState) => {
      setTransportState(newState);

      log(LogMessageType.INFO, `# ${transport.getName()} state changed to ${newState}`);
    },

    // called on transport error
    onError: (_transport, error) => {
      log(LogMessageType.ERROR, `@ transport error occurred${error ? ` (${error.message})` : ""}`);
    },

    // called when transport message is sent
    onMessageSent: (transport, message, wasSentSuccessfully: boolean) => {
      const [command] = message.split(":");
      const noLogCommands: string[] = [];

      // don't blacklisted messages
      if (!noLogCommands.includes(command)) {
        if (wasSentSuccessfully) {
          log(LogMessageType.SEND, `${message}${!wasSentSuccessfully ? " [SENDING FAILED]" : ""}`, transport.getName());
        } else {
          log(LogMessageType.ERROR, `Sending message "${message}" failed`, transport.getName());
        }
      }
    },

    // called when transport message is received
    onMessageReceived: (transport, message) => {
      const [command] = message.split(":");
      const noLogCommands = ["e", "b", "l"];

      // don't blacklisted messages
      if (!noLogCommands.includes(command)) {
        log(LogMessageType.RECEIVE, message, transport.getName());
      }
    },
  });
}
