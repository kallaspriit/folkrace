import * as React from "react";
import { Subscribe } from "unstated";

import LogContainer from "../../containers/LogContainer";
import StatusContainer, {
  SerialState,
  SerialType
} from "../../containers/StatusContainer";
import { WebSocketState } from "../../lib/web-socket-client/index";
import webSocketClient from "../../services/webSocketClient";

export interface ContainerMap {
  logContainer: LogContainer;
  statusContainer: StatusContainer;
}

export enum WebSocketCommand {
  SERIAL = "serial",
  GET_VOLTAGE = "get-voltage",
  IP = "ip"
}

export type WebSocketCommandHandlerFn = (
  args: string[],
  containers: ContainerMap
) => void;

export interface WebSocketCommandHandlersMap {
  [x: string]: WebSocketCommandHandlerFn | undefined;
}

const REQUEST_BATTERY_VOLTAGE_INTERVAL = 60 * 1000; // once per minute

// runtime info
let isInitialized = false;
let requestBatteryVoltageInterval: number | null = null;

// command handlers map
const webSocketCommandHandlers: WebSocketCommandHandlersMap = {
  [WebSocketCommand.SERIAL]: handleWebSocketSerialCommand,
  [WebSocketCommand.GET_VOLTAGE]: handleWebSocketGetVoltageCommand,
  [WebSocketCommand.IP]: handleWebSocketIpCommand

  // TODO: handle "e"
  // TODO: handle "set-speed"
  // TODO: handle "usb"
};

// glue component, connects external data to containers, does not render anything
const Glue: React.SFC<{}> = () => (
  <Subscribe to={[LogContainer, StatusContainer]}>
    {(logContainer: LogContainer, statusContainer: StatusContainer) => {
      // return if already set up
      if (isInitialized) {
        return null;
      }

      // set initial state
      statusContainer.setWebSocketState(webSocketClient.state);

      // subscribe to web-socket events
      webSocketClient.subscribe({
        onConnecting: (_ws, _wasConnected) => {
          logContainer.addEntry("web-socket connecting..");
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
      isInitialized = true;

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
  containers.logContainer.addEntry(`< ${message}`);

  // parse message
  const [name, ...args] = message.split(":");

  handleWebSocketCommand(name, args, containers);
}

// handles parsed web-socket commands
function handleWebSocketCommand(
  name: string,
  args: string[],
  containers: ContainerMap
) {
  const handler = webSocketCommandHandlers[name];

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

// handles serial status command
function handleWebSocketSerialCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  // extract serial info
  const serialType = args[0] as SerialType;
  const serialState = args[1] as SerialState;
  const serialDeviceName = typeof args[2] === "string" ? args[2] : undefined;

  // update serial state
  statusContainer.setSerialState(serialType, serialState, serialDeviceName);

  const connectedSerial = statusContainer.getConnectedSerial();

  // ask for some initial state info once a serial connection is established
  if (connectedSerial !== undefined) {
    // request current voltage
    requestVoltage();

    // also setup an interval to ask the voltage level periodically
    requestBatteryVoltageInterval = window.setInterval(() => {
      requestVoltage();
    }, REQUEST_BATTERY_VOLTAGE_INTERVAL);
  } else {
    // clear the battery voltage interval if exists
    if (requestBatteryVoltageInterval !== null) {
      window.clearInterval(requestBatteryVoltageInterval);

      requestBatteryVoltageInterval = null;
    }

    // no serial connection so we can't be sure of battery voltage
    statusContainer.setBatteryVoltage(undefined);
  }
}

// handles voltage response
function handleWebSocketGetVoltageCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  const voltage = parseFloat(args[0]);

  statusContainer.setBatteryVoltage(voltage);
}

// handles remote ip address
function handleWebSocketIpCommand(
  args: string[],
  { statusContainer }: ContainerMap
) {
  const remoteIp = args[0];

  statusContainer.setRemoteIp(remoteIp);
}

// requests for the current voltage level
function requestVoltage() {
  webSocketClient.send("get-voltage");
}

export default Glue;
