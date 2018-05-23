import * as React from "react";
import { Subscribe } from "unstated";
import webSocketClient from "../../services/webSocketClient";
import LogContainer from "../../containers/LogContainer";
import StatusContainer, { BluetoothState } from "../../containers/StatusContainer";
import { WebSocketState } from "../../lib/web-socket-client/index";

export interface ContainerMap {
  logContainer: LogContainer;
  statusContainer: StatusContainer;
}

export enum WebSocketCommand {
  BLUETOOTH = "bluetooth",
  GET_VOLTAGE = "get-voltage",
}

export type WebSocketCommandHandlerFn = (args: string[], containers: ContainerMap) => void;

export interface WebSocketCommandHandlersMap {
  [x: string]: WebSocketCommandHandlerFn | undefined;
}

const REQUEST_BATTERY_VOLTAGE_INTERVAL = 60 * 1000; // once per minute

let isDone = false;
let requestBatteryVoltageInterval: number | null = null;

// glue component, connects external data to containers, does not render anything
const Glue: React.SFC<{}> = () => (
  <Subscribe to={[LogContainer, StatusContainer]}>
    {(logContainer: LogContainer, statusContainer: StatusContainer) => {
      // return if already set up
      if (isDone) {
        return null;
      }

      // set initial state
      statusContainer.setWebSocketState(webSocketClient.state);

      // subscribe to web-socket events
      webSocketClient.subscribe({
        onConnecting: (_ws, _wasConnected) => {
          // not handled
        },
        onOpen: (_ws, _event) => {
          logContainer.addEntry("web-socket connection established");
        },
        onClose: (_ws, _event, wasConnected) => {
          if (wasConnected) {
            logContainer.addEntry("web-socket connection was lost");
          } else {
            logContainer.addEntry("establishing web-socket connection failed");
          }
        },
        onError: (_ws, _event, _wasConnected) => {
          // not handled
        },
        onMessage: (_ws, message) => {
          // handle the message
          handleWebSocketMessage(message, { logContainer, statusContainer });
        },
        onStateChanged: (_ws, newState, _oldState) => {
          statusContainer.setWebSocketState(newState);

          // also reset other statuses if web-socket connection is lost
          if (newState === WebSocketState.DISCONNECTED) {
            statusContainer.setBluetoothState(BluetoothState.DISCONNECTED);
            statusContainer.setBatteryVoltage(undefined);
          }
        },
        onSendMessage: (_ws, message) => {
          logContainer.addEntry(`> ${message}`);
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

  console.log("handleWebSocketMessage", message);

  // log the message
  containers.logContainer.addEntry(`< ${message}`);

  // parse message
  const [name, ...args] = message.split(":");

  handleWebSocketCommand(name, args, containers);
}

const webSocketCommandHandlers: WebSocketCommandHandlersMap = {
  // handles bluetooth state changes
  [WebSocketCommand.BLUETOOTH]: (args: string[], containers: ContainerMap) => {
    const state = args[0] as BluetoothState;
    let bluetoothDeviceName: string | undefined;

    switch (state) {
      case BluetoothState.CONNECTED:
        bluetoothDeviceName = args[1];
        break;

      default:
      // no action required
    }

    // ask for some initial state info once bluetooth connection is established
    if (state === BluetoothState.CONNECTED) {
      // request voltage
      webSocketClient.send("get-voltage");

      // also setup an interval to ask it periodically
      requestBatteryVoltageInterval = window.setInterval(() => {
        webSocketClient.send("get-voltage");
      }, REQUEST_BATTERY_VOLTAGE_INTERVAL);
    } else {
      // clear the battery voltage interval if exists
      if (requestBatteryVoltageInterval !== null) {
        window.clearInterval(requestBatteryVoltageInterval);

        requestBatteryVoltageInterval = null;
      }
    }

    containers.statusContainer.setBluetoothState(args[0] as BluetoothState, bluetoothDeviceName);
  },

  // handles battery voltage level
  [WebSocketCommand.GET_VOLTAGE]: (args: string[], containers: ContainerMap) => {
    const voltage = parseFloat(args[0]);

    containers.statusContainer.setBatteryVoltage(voltage);
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
