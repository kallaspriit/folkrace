import * as React from "react";
import { Subscribe } from "unstated";
import webSocketClient from "../../services/webSocketClient";
import LogContainer from "../../containers/LogContainer";
import StatusContainer, { BluetoothState } from "../../containers/StatusContainer";

export interface ContainerMap {
  logContainer: LogContainer;
  statusContainer: StatusContainer;
}

export enum WebSocketCommand {
  BLUETOOTH = "bluetooth",
}

export type WebSocketCommandHandlerFn = (args: string[], containers: ContainerMap) => void;

export interface WebSocketCommandHandlersMap {
  [x: string]: WebSocketCommandHandlerFn | undefined;
}

let isDone = false;

// glue component, connects external data to containers, does not render anything
const Glue: React.SFC<{}> = () => (
  <Subscribe to={[LogContainer, StatusContainer]}>
    {(logContainer: LogContainer, statusContainer: StatusContainer) => {
      // return if already set up
      if (isDone) {
        return null;
      }

      // set initial state
      statusContainer.setWebSocketState(webSocketClient.getState());

      // subscribe to web-socket events
      webSocketClient.subscribe({
        onConnecting: (_ws, wasConnected) => {
          console.log(`glue: ws ${wasConnected ? "reconnecting" : "connecting"}`, event);
        },
        onOpen: (_ws, event) => {
          console.log("glue: ws open", event);

          logContainer.addEntry("web-socket connection established");
        },
        onClose: (_ws, event, wasConnected) => {
          console.log("glue: ws close", event);

          if (wasConnected) {
            logContainer.addEntry("web-socket connection was lost", true);
          } else {
            logContainer.addEntry("establishing web-socket connection failed", true);
          }
        },
        onError: (_ws, event, wasConnected) => {
          console.log("glue: ws error", event, wasConnected);
        },
        onMessage: (_ws, message) => {
          // handle the message
          handleWebSocketMessage(message, { logContainer, statusContainer });
        },
        onStateChanged: (_ws, newState, oldState) => {
          console.log(`glue: ws state changed from ${oldState} to ${newState}`);

          statusContainer.setWebSocketState(newState);
        },
      });

      // don't run this logic again
      isDone = true;

      // don't render anything
      return null;
    }}
  </Subscribe>
);

// handles web-socket messages
function handleWebSocketMessage(message: string, containers: ContainerMap) {
  // ignore empty messages
  if (message.length === 0) {
    return;
  }

  // log the message
  containers.logContainer.addEntry(message);

  // parse message
  const [name, ...args] = message.split(":");

  handleWebSocketCommand(name, args, containers);
}

const webSocketCommandHandlers: WebSocketCommandHandlersMap = {
  // handles bluetooth state changes
  [WebSocketCommand.BLUETOOTH]: (args: string[], containers: ContainerMap) => {
    console.log("got bluetooth state", args, containers);

    const state = args[0] as BluetoothState;
    let bluetoothDeviceName: string | undefined;

    switch (state) {
      case BluetoothState.CONNECTED:
        bluetoothDeviceName = args[1];
        break;

      default:
      // no action required
    }

    containers.statusContainer.setBluetoothState(args[0] as BluetoothState, bluetoothDeviceName);
  },
};

// handles parsed web-socket commands
function handleWebSocketCommand(name: string, args: string[], containers: ContainerMap) {
  const handler = webSocketCommandHandlers[name];

  // check whether the handler exists
  if (handler === undefined) {
    console.warn(`missing web-socket command handler for "${name}"`);

    return;
  }

  // call the handler
  handler(args, containers);
}

export default Glue;
