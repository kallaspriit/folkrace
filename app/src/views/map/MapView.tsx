import * as React from "react";
import { Subscribe } from "unstated";
import OdometryContainer from "../../containers/OdometryContainer";
import { Grid, GridItem } from "../../components/grid/Grid";

import "./MapView.scss";

const MapView: React.SFC = () => (
  <Subscribe to={[OdometryContainer]}>
    {(odometryContainer: OdometryContainer) => (
      <div className="view view--grid map-view">
        <Grid className="map-grid">
          <GridItem className="odometry">
            Left: {odometryContainer.state.left}
          </GridItem>
          <GridItem className="odometry">
            Right: {odometryContainer.state.right}
          </GridItem>
        </Grid>
      </div>
    )}
  </Subscribe>
);

export default MapView;
