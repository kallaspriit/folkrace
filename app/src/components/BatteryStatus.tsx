import React from "react";
import { Subscribe } from "unstated";

import { BatteryState, StatusContainer } from "../containers/StatusContainer";
import { assertUnreachable } from "../services/assertUnreachable";
import { robot } from "../services/robot";

import { GridItem, GridItemStatus } from "./Grid";
import { BatteryIcon } from "./Icon";
import { Text } from "./Text";

export const BatteryStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(status: StatusContainer) => {
      const batteryStatus = getBatteryStatus(status.batteryState);
      const description = status.state.batteryVoltage
        ? `${status.state.batteryVoltage.toFixed(1)}V`
        : "Unknown";

      return (
        <GridItem status={batteryStatus} onClick={() => robot.requestVoltage()}>
          <BatteryIcon />
          <Text primary>Battery</Text>
          <Text>{description}</Text>
        </GridItem>
      );
    }}
  </Subscribe>
);

function getBatteryStatus(batteryState: BatteryState): GridItemStatus {
  switch (batteryState) {
    case BatteryState.UNKNOWN:
      return GridItemStatus.BAD;

    case BatteryState.FULL:
      return GridItemStatus.GOOD;

    case BatteryState.LOW:
      return GridItemStatus.WARN;

    case BatteryState.CRITICAL:
      return GridItemStatus.BAD;

    default:
      return assertUnreachable(batteryState, "got unexpected battery state");
  }
}
