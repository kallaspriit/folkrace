import * as React from "react";
import { Subscribe } from "unstated";
import OdometryContainer from "../../containers/OdometryContainer";
import { Grid, GridItem } from "../../components/grid/Grid";

import "./MapView.scss";
import LidarContainer, {
  LidarMeasurement
} from "../../containers/LidarContainer";

const MapView: React.SFC = () => (
  <div className="view view--grid map-view">
    <Grid className="map-grid">
      <Subscribe to={[OdometryContainer]}>
        {(odometryContainer: OdometryContainer) => (
          <React.Fragment>
            <GridItem className="text">
              Left: {odometryContainer.state.left}
            </GridItem>
            <GridItem className="text">
              Right: {odometryContainer.state.right}
            </GridItem>
          </React.Fragment>
        )}
      </Subscribe>
      <Subscribe to={[LidarContainer]}>
        {(lidarContainer: LidarContainer) => (
          <React.Fragment>
            <GridItem className="text">
              Measurement count: {lidarContainer.state.measurements.length}
            </GridItem>
            <GridItem className="text">
              Last measurement:{" "}
              {renderMeasurement(
                lidarContainer.state.measurements[
                  lidarContainer.state.measurements.length - 1
                ]
              )}
            </GridItem>
          </React.Fragment>
        )}
      </Subscribe>
    </Grid>
  </div>
);

function renderMeasurement(measurement?: LidarMeasurement) {
  if (!measurement) {
    return "n/a";
  }

  return (
    <div>
      <div>
        <strong>Angle:</strong> {measurement.angle}
      </div>
      <div>
        <strong>Distance:</strong> {measurement.distance}
      </div>
      <div>
        <strong>Quality:</strong> {measurement.quality}
      </div>
    </div>
  );
}

export default MapView;
