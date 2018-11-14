import * as React from "react";
import { Subscribe } from "unstated";

import LogContainer from "../../containers/LogContainer";
import StatusContainer, {
  SerialState,
  SerialType
} from "../../containers/StatusContainer";
import { WebSocketState } from "../../lib/web-socket-client/index";
import webSocketClient from "../../services/webSocketClient";
import handleSerialCommand from "../../command-handlers/serial";
import handleGetVoltageCommand from "../../command-handlers/get-voltage";
import handleIpCommand from "../../command-handlers/ip";
import handleUsbCommand from "../../command-handlers/usb";
import OdometryContainer from "../../containers/OdometryContainer";
import handleECommand from "../../command-handlers/e";

export interface ContainerMap {
  logContainer: LogContainer;
  statusContainer: StatusContainer;
  odometryContainer: OdometryContainer;
}

export type WebSocketCommandHandlerFn = (
  args: string[],
  containers: ContainerMap
) => void;

export interface WebSocketCommandHandlersMap {
  [x: string]: WebSocketCommandHandlerFn | undefined;
}

// connection manager component, connects external data to containers, does not render anything visual
export default class ConnectionManager extends React.Component {
  private isInitialized = false;
  private webSocketCommandHandlers: WebSocketCommandHandlersMap = {
    serial: handleSerialCommand,
    "get-voltage": handleGetVoltageCommand,
    ip: handleIpCommand,
    usb: handleUsbCommand,
    e: handleECommand

    // TODO: handle "set-speed"
  };

  render() {
    return (
      <Subscribe to={[LogContainer, StatusContainer, OdometryContainer]}>
        {(
          logContainer: LogContainer,
          statusContainer: StatusContainer,
          odometryContainer: OdometryContainer
        ) => {
          // return if already set up
          if (this.isInitialized) {
            return null;
          }

          // set initial state
          statusContainer.setWebSocketState(webSocketClient.state);

          // subscribe to web-socket events
          webSocketClient.subscribe({
            onConnecting: (_ws, _wasConnected) => {
              logContainer.addEntry("# web-socket connecting..");
            },
            onOpen: (_ws, _event) => {
              logContainer.addEntry("# web-socket connection established");
            },
            onClose: (_ws, _event, wasConnected) => {
              if (wasConnected) {
                logContainer.addEntry("# web-socket connection was lost");
              } else {
                logContainer.addEntry(
                  "# establishing web-socket connection failed"
                );
              }
            },
            onError: (_ws, _event, _wasConnected) => {
              logContainer.addEntry("# get web-socket error");
            },
            onMessage: (_ws, message) => {
              // handle the message
              this.handleWebSocketMessage(message, {
                logContainer,
                statusContainer,
                odometryContainer
              });
            },
            onStateChanged: (_ws, newState, _oldState) => {
              statusContainer.setWebSocketState(newState);

              // also reset other statuses if web-socket connection is lost
              if (newState === WebSocketState.DISCONNECTED) {
                statusContainer.setSerialState(
                  SerialType.BLUETOOTH,
                  SerialState.DISCONNECTED
                );
                statusContainer.setSerialState(
                  SerialType.USB,
                  SerialState.DISCONNECTED
                );
                statusContainer.setBatteryVoltage(undefined);
              }
            },
            onSendMessage: (_ws, message) => {
              logContainer.addEntry(`> ${message}`);
            }
          });

          // don't run this logic again
          this.isInitialized = true;

          // don't render anything
          return null;
        }}
      </Subscribe>
    );
  }

  // handles web-socket messages
  private handleWebSocketMessage(message: string, containers: ContainerMap) {
    // ignore empty messages
    if (message.length === 0) {
      return;
    }

    // log the message
    containers.logContainer.addEntry(`< ${message}`);

    // parse message
    const [name, ...args] = message.split(":");

    // attempt to handle command
    this.handleWebSocketCommand(name, args, containers);
  }

  // handles parsed web-socket commands
  private handleWebSocketCommand(
    name: string,
    args: string[],
    containers: ContainerMap
  ) {
    const handler = this.webSocketCommandHandlers[name];

    // check whether the handler exists
    if (handler === undefined) {
      console.warn(
        `missing web-socket command handler for "${name}" (${args.join(", ")})`
      );

      return;
    }

    // call the handler
    handler(args, containers);
  }
}
