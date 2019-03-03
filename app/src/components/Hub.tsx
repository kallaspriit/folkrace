import React from "react";
import { Subscribe } from "unstated";

import { AhrsContainer } from "../containers/AhrsContainer";
import { ButtonContainer } from "../containers/ButtonContainer";
import { LidarContainer } from "../containers/LidarContainer";
import { LogContainer } from "../containers/LogContainer";
import { MeasurementsContainer } from "../containers/MeasurementsContainer";
import { OdometryContainer } from "../containers/OdometryContainer";
import { RobotContainer } from "../containers/RobotContainer";
import { StatusContainer } from "../containers/StatusContainer";
import { handleCommand } from "../handlers";
import { ContainerMap, setContainers } from "../services/containers";
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
          MeasurementsContainer,
          AhrsContainer,
        ]}
      >
        {(
          log: LogContainer,
          status: StatusContainer,
          odometry: OdometryContainer,
          lidar: LidarContainer,
          button: ButtonContainer,
          robot: RobotContainer,
          measurements: MeasurementsContainer,
          ahrs: AhrsContainer,
        ) => {
          // only initialize the connection logic once
          if (this.isInitialized) {
            return null;
          }

          // setup container map
          const containers: ContainerMap = {
            log,
            status,
            odometry,
            lidar,
            button,
            robot,
            measurements,
            ahrs,
          };

          // make the containers globally available
          setContainers(containers);

          // register as log listener and proxy to log container
          addLogListener(message => log.addEntry(message));

          // set initial transport state
          void status.setTransportState(multiTransport.getState());

          // subscribe to transport events
          multiTransport.addListener({
            onStateChanged: (transport, newState, _previousState) => {
              log.addEntry(`# ${transport.getName()} state changed to ${newState}`);

              void status.setTransportState(newState);
            },
            onError: (_transport, error) => {
              log.addEntry(`# transport error occurred${error ? ` (${error.message})` : ""}`);
            },
            onMessageSent: (_transport, message, wasSentSuccessfully: boolean) => {
              const [command] = message.split(":");
              const noLogCommands = ["ping", "!ping"];

              // don't log single-character recurring commands ("s" for speed etc)
              if (command.length === 1 || noLogCommands.includes(command)) {
                return;
              }

              log.addEntry(`> ${message}${!wasSentSuccessfully ? " (sending failed)" : ""}`);
            },
            onMessageReceived: (_transport, message) => {
              this.handleTransportMessage(message, containers);
            },
          });

          // attempt to establish connection
          void multiTransport.connect();

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
    const [command, ...args] = message.split(":");
    const noLogCommands = ["pong", "lidar"];

    // dont log single-character commands (fast lidar measurements, encoders etc)
    if (command.length > 1 && noLogCommands.indexOf(command) === -1) {
      containers.log.addEntry(`< ${message}`);
    }

    // attempt to handle command
    handleCommand(command, args, containers);
  }
}
