import * as React from "react";
import titleCase from "title-case";
import { Subscribe } from "unstated";
import { StatusContainer } from "../containers/StatusContainer";
import { GridItem, GridItemStatus } from "./Grid";
import { WebSocketState } from "../lib/web-socket-client";
import { robot } from "../services/robot";
import { WebSocketIcon } from "./Icon";
import { Text } from "./Text";

export const WebSocketStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(statusContainer: StatusContainer) => {
      const status =
        statusContainer.state.webSocketState === WebSocketState.CONNECTED
          ? GridItemStatus.GOOD
          : GridItemStatus.BAD;
      const description =
        statusContainer.state.webSocketState !== WebSocketState.CONNECTED ||
        statusContainer.state.remoteIp === undefined
          ? titleCase(statusContainer.state.webSocketState)
          : statusContainer.state.remoteIp;

      return (
        <GridItem status={status} onClick={() => robot.ping()}>
          <WebSocketIcon />
          <Text primary>Web Socket</Text>
          <Text>{description}</Text>
        </GridItem>
      );
    }}
  </Subscribe>
);
