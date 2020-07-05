import React from "react";
import { Subscribe } from "unstated";

import { LidarContainer } from "../containers/LidarContainer";
import { robot } from "../services/robot";

import { Cell, CellStatus } from "./Grid";
import { LidarIcon } from "./Icon";
import { Text } from "./Text";

export const LidarStatus: React.SFC = () => (
  <Subscribe to={[LidarContainer]}>
    {(lidar: LidarContainer) => {
      const { status, description } = getLidarStatus(lidar);

      return (
        <Cell
          status={status}
          onClick={() =>
            lidar.state.isStarted ? robot.stopLidar() : robot.startLidar()
          }
        >
          <LidarIcon />
          <Text primary>Lidar</Text>
          <Text>{description}</Text>
        </Cell>
      );
    }}
  </Subscribe>
);

function getLidarStatus(lidar: LidarContainer) {
  let status = CellStatus.BAD;
  let description = "Stopped";

  if (lidar.state.isValid) {
    status = CellStatus.GOOD;
    description = `${Math.round(lidar.state.currentRpm)}/${
      lidar.state.targetRpm
    } RPM`;
  } else if (lidar.state.isStarted) {
    status = CellStatus.WARN;
    description = "Unstable";
  }

  return {
    status,
    description,
  };
}
