import * as React from "react";
import "./StatusView.scss";

const StatusView: React.StatelessComponent<{}> = () => (
  <div className="view status-view">
    <div className="status-grid">
      <div className="status-grid__item status-grid__item--bluetooth">Bluetooth</div>
      <div className="status-grid__item status-grid__item--web-socket">Web socket</div>
      <div className="status-grid__item status-grid__item--log">Log</div>
    </div>
  </div>
);

export default StatusView;
