import { useMemo, useEffect } from "react";
import { useSetRecoilState } from "recoil";
import { config } from "../config";
import { TransportListener, TransportStatus } from "../lib/transport";
import { multiTransport } from "../services/multiTransport";
import { robot } from "../services/robot";
import { activeTransportNameState } from "../state/activeTransportNameState";
import { LogMessageType } from "../state/logMessagesState";
import { timerState } from "../state/timerState";
import { transportStatusState } from "../state/transportStatusState";
import { useHandleCommand } from "./useHandleCommand";
import { useInterval } from "./useInterval";
import { useLog } from "./useLog";
import { useTransportListener } from "./useTransportListener";

// const messageQueue: string[] = [];
// const noLogCommands = ["e", "b", "l", "a"];

// listens for events from multi-transport and forwards it to state
export function useStateRouter() {
  const setTransportStatus = useSetRecoilState(transportStatusState);
  const setActiveTransportName = useSetRecoilState(activeTransportNameState);
  const setTimer = useSetRecoilState(timerState);
  const log = useLog();
  const handleCommand = useHandleCommand();

  useInterval(() => {
    setTimer(Date.now());
  }, 1000);

  useEffect(() => {
    // test log messages
    log(LogMessageType.INFO, "info message");
    log(LogMessageType.SEND, "send message");
    log(LogMessageType.RECEIVE, "receive message");
    log(LogMessageType.WARN, "warn message");
    log(LogMessageType.ERROR, "error message");

    const currentTransportState = multiTransport.getState();

    // set initial transport state
    setTransportStatus(currentTransportState);

    // update timer every second (useful to check something at interval)
  }, [log, setTransportStatus]);

  // configure transport listener
  const transportListener = useMemo<TransportListener>(
    () => ({
      // called when active transport state changes
      onStatusChanged: (transport, newStatus, previousStatus) => {
        setTransportStatus(newStatus);
        setActiveTransportName(transport.getName());

        // request state once connected
        if (newStatus === TransportStatus.CONNECTED) {
          robot.requestState();
        }

        log(LogMessageType.INFO, `${transport.getName()} state changed from ${previousStatus} to ${newStatus}`);
      },

      // called on transport error
      onError: (_transport, error) => {
        log(LogMessageType.ERROR, `transport error occurred${error ? ` (${error.message})` : ""}`);
      },

      // called when transport message is sent
      onMessageSent: (transport, message, wasSentSuccessfully: boolean) => {
        const [command] = message.split(":");

        // don't log blacklisted messages
        if (!config.log.ignoreSentCommands.includes(command)) {
          if (wasSentSuccessfully) {
            log(
              LogMessageType.SEND,
              `${message}${!wasSentSuccessfully ? " [SENDING FAILED]" : ""}`,
              transport.getName(),
            );
          } else {
            log(LogMessageType.ERROR, `sending message "${message}" failed`, transport.getName());
          }
        }
      },

      // called when transport message is received
      onMessageReceived: (transport, message) => {
        const [command, ...args] = message.split(":");

        // don't blacklisted messages
        if (!config.log.ignoreReceivedCommands.includes(command)) {
          log(LogMessageType.RECEIVE, message, transport.getName());
        }

        // handle the command
        handleCommand(command, args);
      },
    }),
    // we don't want to create new listener when log changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // adds new multi-transport listeners and forwards the events to state
  useTransportListener(transportListener);
}
