import * as React from "react";
import { Subscribe } from "unstated";
import StatusContainer from "../../../containers/StatusContainer";
import { GridItem } from "../../../components/grid/Grid";
import classNames from "classnames";
import titleCase from "title-case";
import { WebSocketState } from "../../../lib/web-socket-client";
import robot from "../../../services/robot";

const WebSocketStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(statusContainer: StatusContainer) => (
      <GridItem
        className={classNames(
          "grid-status",
          statusContainer.state.webSocketState === WebSocketState.CONNECTED
            ? "bg--good"
            : "bg--bad"
        )}
        onClick={() => robot.ping()}
      >
        <div className="grid__icon">
          <i className="icon icon__web-socket" />
        </div>
        <div className="grid__text">
          <div className="grid__text--primary">Web Socket</div>
          <div className="grid__text--secondary">
            {statusContainer.state.webSocketState !==
              WebSocketState.CONNECTED &&
            statusContainer.state.remoteIp !== undefined
              ? titleCase(statusContainer.state.webSocketState)
              : statusContainer.state.remoteIp}
          </div>
        </div>
      </GridItem>
    )}
  </Subscribe>
);

export default WebSocketStatus;
