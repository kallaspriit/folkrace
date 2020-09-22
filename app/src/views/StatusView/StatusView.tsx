import React from "react";
import { Grid } from "../../components/Grid/Grid";
import { SerialStatus } from "../../components/SerialStatus/SerialStatus";
import { TransportStatus } from "../../components/TransportStatus/TransportStatus";
import { View } from "../../components/View/View";
import styles from "./StatusView.module.scss";

export const StatusView: React.FC = () => (
  <View>
    <Grid className={styles["status-grid"]}>
      <SerialStatus />
      <TransportStatus />
    </Grid>
  </View>
);
