import * as React from "react";
import "./StatusView.scss";
import { Grid, GridItem } from "../../components/grid/Grid";
import { Subscribe } from "unstated";
import LogContainer from "../../containers/LogContainer";
import formatTime from "../../services/formatTime";
import StatusContainer from "../../containers/StatusContainer";
import * as classNames from "classnames";
import { titleCase } from "change-case";
import { WebSocketState } from "../../lib/web-socket-client/index";

// TODO: handle clearing logs
// TODO: add motor controller, http server, IMU
const StatusView: React.SFC = () => (
  <Subscribe to={[LogContainer, StatusContainer]}>
    {(logContainer: LogContainer, statusContainer: StatusContainer) => (
      <div className="view view--grid status-view">
        <Grid>
          <GridItem className="grid-status bg--good">
            <div className="grid__icon">
              <i className="icon icon__bluetooth" />
            </div>
            <div className="grid__text">
              <div className="grid__text--primary">Bluetooth</div>
              <div className="grid__text--secondary">Connected: HC-06</div>
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
          <GridItem className="log" scrollToBottom>
            {logContainer.state.entries.map(entry => (
              <div className="log__entry" key={entry.id}>
                <span className="log__entry__time">{formatTime(entry.time)}</span>{" "}
                <span className="log__entry__message">{entry.message}</span>
              </div>
            ))}
          </GridItem>
        </Grid>
      </div>
    )}
  </Subscribe>
);

export default StatusView;
