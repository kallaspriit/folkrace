import * as React from "react";
import { Subscribe } from "unstated";

import { LidarContainer } from "../containers/LidarContainer";
import { robot } from "../services/robot";

import { GridItem, GridItemStatus } from "./Grid";
import { LidarIcon } from "./Icon";
import { Text } from "./Text";

export const LidarStatus: React.SFC = () => (
  <Subscribe to={[LidarContainer]}>
    {(lidar: LidarContainer) => {
      const { status, description } = getLidarStatus(lidar);

      return (
        <GridItem status={status} onClick={() => robot.startLidar()}>
          <LidarIcon />
          <Text primary>Lidar</Text>
          <Text>{description}</Text>
        </GridItem>
      );
    }}
  </Subscribe>
);

function getLidarStatus(lidar: LidarContainer) {
  let status = GridItemStatus.BAD;
  let description = "Stopped";

  if (lidar.state.isValid) {
    status = GridItemStatus.GOOD;
    description = `${Math.round(lidar.state.currentRpm)}/${
      lidar.state.targetRpm
    } RPM`;
  } else if (lidar.state.isStarted) {
    status = GridItemStatus.WARN;
    description = "Unstable";
  }

  return {
    status,
    description
  };
}
