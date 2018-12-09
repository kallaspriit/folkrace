import * as React from "react";

import { BatteryStatus } from "../components/BatteryStatus";
import { Grid } from "../components/Grid";
import { LidarStatus } from "../components/LidarStatus";
import { Log } from "../components/Log";
import { TransportStatus } from "../components/TransportStatus";
import { UsbStatus } from "../components/UsbStatus";
import { View } from "../components/View";
import { styled } from "../styled";

const StatusGrid = styled(Grid)`
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px 100px;
`;

// TODO: add target and real speed (compare %?)
// TODO: add odometry (visualize path?)
// TODO: add lidar (tiny map?)
// TODO: add buttons (state for each?)
export const StatusView: React.SFC = () => (
  <View grid>
    <StatusGrid>
      <UsbStatus />
      <TransportStatus />
      <BatteryStatus />
      <LidarStatus />
      <Log />
    </StatusGrid>
  </View>
);
