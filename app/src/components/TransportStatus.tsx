import * as React from "react";
import titleCase from "title-case";
import { Subscribe } from "unstated";

import { StatusContainer } from "../containers/StatusContainer";
import { TransportState } from "../lib/transport/Transport";
import { multiTransport } from "../services/multiTransport";
import { robot } from "../services/robot";

import { GridItem, GridItemStatus } from "./Grid";
import { WebSocketIcon } from "./Icon";
import { Text } from "./Text";

export const TransportStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(statusContainer: StatusContainer) => {
      const status =
        statusContainer.state.transportState === TransportState.CONNECTED
          ? GridItemStatus.GOOD
          : GridItemStatus.BAD;
      const description =
        statusContainer.state.transportState !== TransportState.CONNECTED ||
        statusContainer.state.remoteIp === undefined
          ? titleCase(statusContainer.state.transportState)
          : statusContainer.state.remoteIp;

      return (
        <GridItem
          status={status}
          onClick={() =>
            robot.ping(statusContainer.getConnectedSerial() === undefined)
          }
        >
          <WebSocketIcon />
          <Text primary={true}>{multiTransport.getName()}</Text>
          <Text>{description}</Text>
        </GridItem>
      );
    }}
  </Subscribe>
);
