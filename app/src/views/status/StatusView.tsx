import classNames from "classnames";
import * as React from "react";
import titleCase from "title-case";
import { Subscribe } from "unstated";

import { Grid, GridItem } from "../../components/grid/Grid";
import Icon from "../../components/icon/Icon";
import LogContainer from "../../containers/LogContainer";
import StatusContainer, {
  BatteryState,
  SerialType
} from "../../containers/StatusContainer";
import { WebSocketState } from "../../lib/web-socket-client/index";
import assertUnreachable from "../../services/assertUnreachable";
import formatTime from "../../services/formatTime";

import "./StatusView.scss";

// TODO: add motor controller, http server, IMU, heartbeat
const StatusView: React.SFC = () => (
  <Subscribe to={[LogContainer, StatusContainer]}>
    {(logContainer: LogContainer, statusContainer: StatusContainer) => {
      const connectedSerial = statusContainer.getConnectedSerial();

      return (
        <div className="view view--grid status-view">
          <Grid className="status-grid">
            <GridItem
              className={classNames(
                "grid-status",
                connectedSerial !== undefined ? "bg--good" : "bg--bad"
              )}
            >
              <div className="grid__icon">
                <i
                  className={
                    connectedSerial &&
                    connectedSerial.type === SerialType.BLUETOOTH
                      ? "icon icon__bluetooth"
                      : "icon icon__serial"
                  }
                />
              </div>
              <div className="grid__text">
                <div className="grid__text--primary">
                  {connectedSerial ? connectedSerial.type : "Serial"}
                </div>
                <div className="grid__text--secondary">
                  {titleCase(
                    connectedSerial ? connectedSerial.state : "Disconnected"
                  )}
                  {connectedSerial && connectedSerial.deviceName
                    ? `: ${connectedSerial.deviceName}`
                    : ""}
                </div>
              </div>
            </GridItem>
            <GridItem
              className={classNames(
                "grid-status",
                statusContainer.state.webSocketState ===
                  WebSocketState.CONNECTED
                  ? "bg--good"
                  : "bg--bad"
              )}
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
            <GridItem
              className={classNames(
                "grid-status",
                getBatteryLevelClass(statusContainer.batteryState)
              )}
            >
              <div className="grid__icon">
                <i className="icon icon__battery" />
              </div>
              <div className="grid__text">
                <div className="grid__text--primary">Battery</div>
                <div className="grid__text--secondary">
                  {statusContainer.state.batteryVoltage
                    ? `${statusContainer.state.batteryVoltage.toFixed(1)}V`
                    : "Unknown"}
                </div>
              </div>
            </GridItem>
            <GridItem className="log" scrollToBottom={true}>
              {logContainer.state.entries.map(entry => (
                <div className="log__entry" key={entry.id}>
                  <span className="log__entry__time">
                    {formatTime(entry.time)}
                  </span>{" "}
                  <span className="log__entry__message">{entry.message}</span>
                  {entry.count > 1 ? (
                    <span className="log__entry__count">{entry.count}</span>
                  ) : null}
                </div>
              ))}
            </GridItem>
          </Grid>
          <div
            className="clear-log-button"
            onClick={() => logContainer.clear()}
          >
            <Icon name="clear" />
          </div>
        </div>
      );
    }}
  </Subscribe>
);

function getBatteryLevelClass(batteryState: BatteryState): string {
  switch (batteryState) {
    case BatteryState.UNKNOWN:
      return "bg--warn";

    case BatteryState.FULL:
      return "bg--good";

    case BatteryState.LOW:
      return "bg--warn";

    case BatteryState.CRITICAL:
      return "bg--bad";

    default:
      return assertUnreachable(batteryState, "got unexpected battery state");
  }
}

export default StatusView;
