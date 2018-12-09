import * as React from "react";
import titleCase from "title-case";
import { Subscribe } from "unstated";

import { StatusContainer } from "../containers/StatusContainer";
import { TransportState } from "../lib/transport/Transport";
import { multiTransport } from "../services/multiTransport";
import { robot } from "../services/robot";

import { GridItem, GridItemStatus } from "./Grid";
import { NativeIcon, WebsocketIcon } from "./Icon";
import { Text } from "./Text";

export const TransportStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(status: StatusContainer) => {
      const transportStatus =
        status.state.transportState === TransportState.CONNECTED
          ? GridItemStatus.GOOD
          : GridItemStatus.BAD;
      const description =
        status.state.transportState !== TransportState.CONNECTED ||
        status.state.remoteIp === undefined
          ? titleCase(status.state.transportState)
          : status.state.remoteIp;

      return (
        <GridItem
          status={transportStatus}
          onClick={() => robot.ping(status.getConnectedSerial() === undefined)}
        >
          {multiTransport.getName() === "Native" ? (
            <NativeIcon />
          ) : (
            <WebsocketIcon />
          )}
          <Text primary>{multiTransport.getName()}</Text>
          <Text>{description}</Text>
        </GridItem>
      );
    }}
  </Subscribe>
);
