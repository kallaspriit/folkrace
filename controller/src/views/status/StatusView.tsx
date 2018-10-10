import * as React from "react";
import "./StatusView.scss";
import { Grid, GridItem } from "../../components/grid/Grid";
import { Subscribe } from "unstated";
import LogContainer from "../../containers/LogContainer";
import formatTime from "../../services/formatTime";
import StatusContainer, { BluetoothState, BatteryState } from "../../containers/StatusContainer";
import * as classNames from "classnames";
import { titleCase } from "change-case";
import { WebSocketState } from "../../lib/web-socket-client/index";
import assertUnreachable from "../../services/assertUnreachable";
import Icon from "../../components/icon/Icon";

// TODO: add motor controller, http server, IMU, heartbeat
const StatusView: React.SFC = () => (
  <Subscribe to={[LogContainer, StatusContainer]}>
    {(logContainer: LogContainer, statusContainer: StatusContainer) => (
      <div className="view view--grid status-view">
        <Grid className="status-grid">
          <GridItem
            className={classNames(
              "grid-status",
              statusContainer.state.bluetoothState === BluetoothState.CONNECTED ? "bg--good" : "bg--bad",
            )}
          >
            <div className="grid__icon">
              <i className="icon icon__bluetooth" />
            </div>
            <div className="grid__text">
              <div className="grid__text--primary">Bluetooth</div>
              <div className="grid__text--secondary">
                {titleCase(statusContainer.state.bluetoothState)}
                {statusContainer.state.bluetoothDeviceName ? `: ${statusContainer.state.bluetoothDeviceName}` : ""}
              </div>
            </div>
          </GridItem>
          <GridItem
            className={classNames(
              "grid-status",
              statusContainer.state.webSocketState === WebSocketState.CONNECTED ? "bg--good" : "bg--bad",
            )}
          >
            <div className="grid__icon">
              <i className="icon icon__web-socket" />
            </div>
            <div className="grid__text">
              <div className="grid__text--primary">Web Socket</div>
              <div className="grid__text--secondary">{titleCase(statusContainer.state.webSocketState)}</div>
            </div>
          </GridItem>
          <GridItem className={classNames("grid-status", getBatteryLevelClass(statusContainer.batteryState))}>
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
          <GridItem className="log" scrollToBottom>
            {logContainer.state.entries.map(entry => (
              <div className="log__entry" key={entry.id}>
                <span className="log__entry__time">{formatTime(entry.time)}</span>{" "}
                <span className="log__entry__message">{entry.message}</span>
              </div>
            ))}
          </GridItem>
        </Grid>
        <div className="clear-log-button" onClick={() => logContainer.clear()}>
          <Icon name="clear" />
        </div>
      </div>
    )}
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
      return assertUnreachable(batteryState, `got unexpected battery state`);
  }
}

export default StatusView;