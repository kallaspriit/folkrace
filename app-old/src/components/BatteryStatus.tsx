import React from "react";
import { Subscribe } from "unstated";

import { BatteryState, StatusContainer } from "../containers/StatusContainer";
import { assertUnreachable } from "../services/assertUnreachable";
import { robot } from "../services/robot";

import { Cell, CellStatus } from "./Grid";
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
        <Cell status={batteryStatus} onClick={() => robot.requestState()}>
          <BatteryIcon />
          <Text primary>Battery</Text>
          <Text>{description}</Text>
        </Cell>
      );
    }}
  </Subscribe>
);

function getBatteryStatus(batteryState: BatteryState): CellStatus {
  switch (batteryState) {
    case BatteryState.UNKNOWN:
      return CellStatus.BAD;

    case BatteryState.FULL:
      return CellStatus.GOOD;

    case BatteryState.LOW:
      return CellStatus.WARN;

    case BatteryState.CRITICAL:
      return CellStatus.BAD;

    default:
      return assertUnreachable(batteryState, "got unexpected battery state");
  }
}
