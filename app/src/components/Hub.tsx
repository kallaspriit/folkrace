import * as React from "react";
import { Subscribe } from "unstated";

import { ButtonContainer } from "../containers/ButtonContainer";
import { LidarContainer } from "../containers/LidarContainer";
import { LogContainer } from "../containers/LogContainer";
import { MeasurementsContainer } from "../containers/MeasurementsContainer";
import { OdometryContainer } from "../containers/OdometryContainer";
import { RobotContainer } from "../containers/RobotContainer";
import { StatusContainer } from "../containers/StatusContainer";

import { ContainerMap, handleCommand } from "../handlers";
import { addLogListener } from "../services/log";
import { multiTransport } from "../services/multiTransport";

// connects transport to containers, does not render anything visual
export class Hub extends React.Component {
  private isInitialized = false;

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

          // register as log listener and proxy to log container
          addLogListener(message => log.addEntry(message));

          // set initial transport state
          void status.setTransportState(multiTransport.getState());

          // subscribe to transport events
          multiTransport.addListener({
            onStateChanged: (transport, newState, previousState) => {
              log.addEntry(
                `# ${transport.getName()} state changed from ${previousState} to ${newState}`
              );

              void status.setTransportState(newState);
            },
            onError: (transport, error) => {
              log.addEntry(
                `# transport error occurred${
                  error ? ` (${error.message})` : ""
                }`
              );
            },
            onMessageSent: (
              _transport,
              message,
              wasSentSuccessfully: boolean
            ) => {
              const [name] = message.split(":");

              // don't log single-character recurring commands ("s" for speed etc)
              if (name.length === 1) {
                return;
              }

              log.addEntry(
                `> ${message}${!wasSentSuccessfully ? " (sending failed)" : ""}`
              );
            },
            onMessageReceived: (_transport, message) => {
              // TODO: make globally available?
              const containers = {
                log,
                status,
                odometry,
                lidar,
                button,
                robot,
                measurements
              };

              this.handleTransportMessage(message, containers);
            }
          });

          // attempt to establish connection
          multiTransport.connect();

          // don't run this logic again
          this.isInitialized = true;

          // don't render anything
          return null;
        }}
      </Subscribe>
    );
  }

  // handles web-socket messages
  private handleTransportMessage(message: string, containers: ContainerMap) {
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
    handleCommand(name, args, containers);
  }
}
