import * as React from "react";
import { Subscribe } from "unstated";
import { LogContainer } from "../containers/LogContainer";
import {
  StatusContainer,
  SerialState,
  SerialType
} from "../containers/StatusContainer";
import { webSocketClient } from "../services/webSocketClient";
import { WebSocketState } from "../lib/web-socket-client/index";
import { OdometryContainer } from "../containers/OdometryContainer";
import { LidarContainer } from "../containers/LidarContainer";
import { ButtonContainer } from "../containers/ButtonContainer";
import { handleSerialCommand } from "../handlers/handleSerialCommand";
import { handleVoltageCommand } from "../handlers/handleGetVoltageCommand";
import { handleIpCommand } from "../handlers/handleIpCommand";
import { handleUsbCommand } from "../handlers/handleUsbCommand";
import { handleEncoderCommand } from "../handlers/handleEncoderCommand";
import { handleBeaconCommand } from "../handlers/handleBeaconCommand";
import { handleMeasurementCommand } from "../handlers/handleMeasurementCommand";
import { handleButtonCommand } from "../handlers/handleButtonCommand";

export interface ContainerMap {
  logContainer: LogContainer;
  statusContainer: StatusContainer;
  odometryContainer: OdometryContainer;
  lidarContainer: LidarContainer;
  buttonContainer: ButtonContainer;
}

export type WebSocketCommandHandlerFn = (
  args: string[],
  containers: ContainerMap
) => void;

export interface WebSocketCommandHandlersMap {
  [x: string]: WebSocketCommandHandlerFn | undefined;
}

// connection manager component, connects external data to containers, does not render anything visual
export class Router extends React.Component {
  private isInitialized = false;
  private webSocketCommandHandlers: WebSocketCommandHandlersMap = {
    serial: handleSerialCommand,
    ip: handleIpCommand,
    usb: handleUsbCommand,
    voltage: handleVoltageCommand,
    button: handleButtonCommand,
    e: handleEncoderCommand,
    b: handleBeaconCommand,
    m: handleMeasurementCommand

    // TODO: handle "speed"
    // TODO: handle "reset"
    // TODO: handle "pong"
  };

  render() {
    return (
      <Subscribe
        to={[
          LogContainer,
          StatusContainer,
          OdometryContainer,
          LidarContainer,
          ButtonContainer
        ]}
      >
        {(
          logContainer: LogContainer,
          statusContainer: StatusContainer,
          odometryContainer: OdometryContainer,
          lidarContainer: LidarContainer,
          buttonContainer: ButtonContainer
        ) => {
          // only initialize the connection logic once
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
                odometryContainer,
                lidarContainer,
                buttonContainer
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
              const [name] = message.split(":");

              // don't log single-character fast commands ("s" for speed etc)
              if (name.length === 1) {
                return;
              }

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

    // parse message
    const [name, ...args] = message.split(":");

    // dont log single-character commands (fast lidar measurements, encoders etc)
    if (name.length > 1) {
      containers.logContainer.addEntry(`< ${message}`);
    }

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
