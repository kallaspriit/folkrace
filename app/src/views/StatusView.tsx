import * as React from "react";
import { Grid } from "../components/Grid";
import { UsbStatus } from "../components/UsbStatus";
import { WebSocketStatus } from "../components/WebSocketStatus";
import { BatteryStatus } from "../components/BatteryStatus";
import { Log } from "../components/Log";
import { styled } from "../styled";
import { View } from "../components/View";

const StatusGrid = styled(Grid)`
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 100px;
`;

// TODO: add target and real speed (compare %?)
// TODO: add odometry (visualize path?)
// TODO: add lidar (tiny map?)
// TODO: add buttons (state for each?)
const StatusView: React.SFC = () => (
  <View grid>
    <StatusGrid>
      <UsbStatus />
      <WebSocketStatus />
      <BatteryStatus />
      <Log />
    </StatusGrid>
  </View>
);

export default StatusView;
