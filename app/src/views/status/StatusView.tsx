import * as React from "react";

import { Grid } from "../../components/grid/Grid";

import "./StatusView.scss";
import UsbStatus from "./items/UsbStatus";
import WebSocketStatus from "./items/WebSocketStatus";
import BatteryStatus from "./items/BatteryStatus";
import Log from "./items/Log";

// TODO: add motor controller, http server, IMU, heartbeat
const StatusView: React.SFC = () => (
  <div className="view view--grid status-view">
    <Grid className="status-grid">
      <UsbStatus />
      <WebSocketStatus />
      <BatteryStatus />
      <Log />
    </Grid>
  </div>
);

export default StatusView;
