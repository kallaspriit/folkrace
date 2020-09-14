import { useRecoilState } from "recoil";
import { multiTransport } from "../services/multiTransport";
import { activeTransportNameState } from "../state/activeTransportNameState";
import { LogMessageType } from "../state/logMessagesState";
import { timerState } from "../state/timerState";
import { transportStateState } from "../state/transportStateState";
import { useHandleCommand } from "./useHandleCommand";
import { useInterval } from "./useInterval";
import { useLog } from "./useLog";
import { useTransportListener } from "./useTransportListener";

// listens for events from multi-transport and forwards it to state
export function useStateRouter() {
  const [transportState, setTransportState] = useRecoilState(transportStateState);
  const [, setActiveTransportName] = useRecoilState(activeTransportNameState);
  const [, setTimer] = useRecoilState(timerState);
  const log = useLog();
  const handleCommand = useHandleCommand();

  const currentTransportState = multiTransport.getState();

  // set initial transport state
  if (transportState !== currentTransportState) {
    setTransportState(currentTransportState);
  }

  // update timer every second (useful to check something at interval)
  useInterval(() => {
    setTimer(Date.now());
  }, 1000);

  // adds new multi-transport listeners and forwards the events to state
  useTransportListener({
    // called when active transport state changes
    onStateChanged: (transport, newState, _previousState) => {
      setTransportState(newState);
      setActiveTransportName(transport.getName());

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
      const [command, ...args] = message.split(":");
      const noLogCommands = ["e", "b", "l", "a"];

      // don't blacklisted messages
      if (!noLogCommands.includes(command)) {
        log(LogMessageType.RECEIVE, message, transport.getName());
      }

      // handle the command
      handleCommand(command, args);
    },
  });
}
