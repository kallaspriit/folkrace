import React from "react";
import { Grid } from "../../components/Grid/Grid";
import { StatusSerial } from "../../components/StatusSerial/StatusSerial";
import { View } from "../../components/View/View";

export const StatusView: React.FC = () => (
  <View>
    <Grid>
      <StatusSerial />
      <StatusSerial />
      <StatusSerial />
      <StatusSerial />
    </Grid>
  </View>
);
