import * as React from "react";
import { Subscribe } from "unstated";
import { StatusContainer, BatteryState } from "../containers/StatusContainer";
import { GridItem, GridItemStatus } from "./Grid";
import assertUnreachable from "../services/assertUnreachable";
import robot from "../services/robot";
import { BatteryIcon } from "./Icon";
import { Text } from "./Text";

export const BatteryStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(statusContainer: StatusContainer) => {
      const status = getBatteryStatus(statusContainer.batteryState);
      const description = statusContainer.state.batteryVoltage
        ? `${statusContainer.state.batteryVoltage.toFixed(1)}V`
        : "Unknown";

      return (
        <GridItem status={status} onClick={() => robot.requestVoltage()}>
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
