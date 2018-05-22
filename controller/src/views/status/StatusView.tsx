import * as React from "react";
import "./StatusView.scss";
import { Grid, GridItem } from "../../components/grid/Grid";

const StatusView: React.StatelessComponent<{}> = () => (
  <div className="view view--grid status-view">
    <Grid>
      <GridItem className="bg--good">
        <div className="grid__icon">
          <i className="icon icon__bluetooth" />
        </div>
        <div className="grid__text">
          <div className="grid__text--primary">Bluetooth</div>
          <div className="grid__text--secondary">Connected: HC-06</div>
        </div>
      </GridItem>
      <GridItem className="bg--bad">
        <div className="grid__icon">
          <i className="icon icon__web-socket" />
        </div>
        <div className="grid__text">
          <div className="grid__text--primary">Web Socket</div>
          <div className="grid__text--secondary">Reconnecting</div>
        </div>
      </GridItem>
      <GridItem className="log">
        <div>&gt; bluetooth connecting</div>
        <div>&gt; bluetooth connected: HC-06</div>
        <div>&lt; set-speed:1000:0</div>
        <div>&gt; e:2342:0</div>
        <div>&gt; e:2652:0</div>
      </GridItem>
    </Grid>
  </div>
);

export default StatusView;
