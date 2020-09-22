import React from "react";
import { Grid } from "../../components/Grid/Grid";
import { SerialStatus } from "../../components/SerialStatus/SerialStatus";
import { TransportStatus } from "../../components/TransportStatus/TransportStatus";
import { View } from "../../components/View/View";

export const StatusView: React.FC = () => (
  <View>
    <Grid>
      <SerialStatus />
      <TransportStatus />
    </Grid>
  </View>
);
