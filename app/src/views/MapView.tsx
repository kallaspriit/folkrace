import React from "react";

import { LidarMap } from "../components/LidarMap";
import { View } from "../components/View";
import { LidarMeasurement } from "../containers/MeasurementsContainer";
import { containers } from "../services/containers";

const fakeMeasurements: LidarMeasurement[] = [
  {
    angle: 0,
    distance: 50,
    quality: 100,
    timestamp: Date.now(),
  },
  {
    angle: 90,
    distance: 100,
    quality: 50,
    timestamp: Date.now(),
  },
];

export const MapView: React.SFC = () => (
  <View>
    <LidarMap
      radius={2}
      cellSize={0.1}
      measurements={() => /*containers.measurements.state.measurements*/ fakeMeasurements}
    />
  </View>
);
