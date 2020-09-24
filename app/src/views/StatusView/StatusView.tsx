import React from "react";
import { BatteryStatus } from "../../components/BatteryStatus/BatteryStatus";
import { FirmwareStatus } from "../../components/FirmwareStatus/FirmwareStatus";
import { Grid } from "../../components/Grid/Grid";
import { LidarStatus } from "../../components/LidarStatus/LidarStatus";
import { SerialStatus } from "../../components/SerialStatus/SerialStatus";
import { TransportStatus } from "../../components/TransportStatus/TransportStatus";
import { View } from "../../components/View/View";
import styles from "./StatusView.module.scss";

export const StatusView: React.FC = () => (
  <View>
    <Grid className={styles["status-grid"]}>
      <SerialStatus />
      <TransportStatus />
      <FirmwareStatus />
      <BatteryStatus />
      <LidarStatus />
    </Grid>
  </View>
);
