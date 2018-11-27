import * as React from "react";
import { Subscribe } from "unstated";

import { ButtonContainer } from "../containers/ButtonContainer";
import { LidarContainer } from "../containers/LidarContainer";
import { LogContainer } from "../containers/LogContainer";
import { MeasurementsContainer } from "../containers/MeasurementsContainer";
import { OdometryContainer } from "../containers/OdometryContainer";
import { RobotContainer } from "../containers/RobotContainer";
import {
  SerialState,
  SerialType,
  StatusContainer
} from "../containers/StatusContainer";
import { handleBeaconCommand } from "../handlers/handleBeaconCommand";
import { handleButtonCommand } from "../handlers/handleButtonCommand";
import { handleCurrentCommand } from "../handlers/handleCurrentCommand";
import { handleEncoderCommand } from "../handlers/handleEncoderCommand";
import { handleVoltageCommand } from "../handlers/handleGetVoltageCommand";
import { handleIpCommand } from "../handlers/handleIpCommand";
import { handleLidarCommand } from "../handlers/handleLidarCommand";
import { handleMeasurementCommand } from "../handlers/handleMeasurementCommand";
import { handlePongCommand } from "../handlers/handlePongCommand";
import { handleResetCommand } from "../handlers/handleResetCommand";
import { handleSerialCommand } from "../handlers/handleSerialCommand";
import { handleSpeedCommand } from "../handlers/handleSpeedCommand";
import { handleUsbCommand } from "../handlers/handleUsbCommand";
import { WebSocketState } from "../lib/web-socket-client/index";
import { webSocketClient } from "../services/webSocketClient";

export interface ContainerMap {
  log: LogContainer;
  status: StatusContainer;
  odometry: OdometryContainer;
  lidar: LidarContainer;
  button: ButtonContainer;
  robot: RobotContainer;
  measurements: MeasurementsContainer;
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
  private readonly webSocketCommandHandlers: WebSocketCommandHandlersMap = {
    serial: handleSerialCommand,
    ip: handleIpCommand,
    usb: handleUsbCommand,
    voltage: handleVoltageCommand,
    button: handleButtonCommand,
    reset: handleResetCommand,
    current: handleCurrentCommand,
    lidar: handleLidarCommand,
    pong: handlePongCommand,
    e: handleEncoderCommand,
    b: handleBeaconCommand,
    m: handleMeasurementCommand,
    s: handleSpeedCommand
  };

  render() {
    return (
      <Subscribe
        to={[
          LogContainer,
          StatusContainer,
          OdometryContainer,
          LidarContainer,
          ButtonContainer,
          RobotContainer,
          MeasurementsContainer
        ]}
      >
        {(
          log: LogContainer,
          status: StatusContainer,
          odometry: OdometryContainer,
          lidar: LidarContainer,
          button: ButtonContainer,
          robot: RobotContainer,
          measurements: MeasurementsContainer
        ) => {
          // only initialize the connection logic once
          if (this.isInitialized) {
            return null;
          }

          // set initial state
          void status.setWebSocketState(webSocketClient.state);

          // subscribe to web-socket events
          webSocketClient.subscribe({
            onConnecting: (ws, _wasConnected) => {
              log.addEntry(`# connecting to ${ws.url}`);
            },
            onOpen: (_ws, _event) => {
              log.addEntry("# web-socket connection established");
            },
            onClose: (_ws, _event, wasConnected) => {
              if (wasConnected) {
                log.addEntry("# web-socket connection was lost");
              } else {
                log.addEntry("# establishing web-socket connection failed");
              }
            },
            onError: (_ws, _event, _wasConnected) => {
              log.addEntry("# get web-socket error");
            },
            onMessage: (_ws, message) => {
              // handle the message
              this.handleWebSocketMessage(message, {
                log,
                status,
                odometry,
                lidar,
                button,
                robot,
                measurements
              });
            },
            onStateChanged: (_ws, newState, _oldState) => {
              void status.setWebSocketState(newState);

              // also reset other statuses if web-socket connection is lost
              if (newState === WebSocketState.DISCONNECTED) {
                void status.setSerialState(
                  SerialType.BLUETOOTH,
                  SerialState.DISCONNECTED
                );
                void status.setSerialState(
                  SerialType.USB,
                  SerialState.DISCONNECTED
                );
                void status.setBatteryVoltage(undefined);
              }
            },
            onSendMessage: (_ws, message) => {
              const [name] = message.split(":");

              // don't log single-character fast commands ("s" for speed etc)
              if (name.length === 1) {
                return;
              }

              log.addEntry(`> ${message}`);
            }
          });

          // attempt to establish web-socket connection
          webSocketClient.connect();

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
      containers.log.addEntry(`< ${message}`);
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
