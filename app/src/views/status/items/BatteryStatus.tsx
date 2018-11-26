import * as React from "react";
import { Subscribe } from "unstated";
import StatusContainer, {
  BatteryState
} from "../../../containers/StatusContainer";
import { GridItem } from "../../../components/grid/Grid";
import classNames from "classnames";
import assertUnreachable from "../../../services/assertUnreachable";
import robot from "../../../services/robot";

const BatteryStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(statusContainer: StatusContainer) => (
      <GridItem
        className={classNames(
          "grid-status",
          getBatteryLevelClass(statusContainer.batteryState)
        )}
        onClick={() => robot.requestVoltage()}
      >
        <div className="grid__icon">
          <i className="icon icon__battery" />
        </div>
        <div className="grid__text">
          <div className="grid__text--primary">Battery</div>
          <div className="grid__text--secondary">
            {statusContainer.state.batteryVoltage
              ? `${statusContainer.state.batteryVoltage.toFixed(1)}V`
              : "Unknown"}
          </div>
        </div>
      </GridItem>
    )}
  </Subscribe>
);

function getBatteryLevelClass(batteryState: BatteryState): string {
  switch (batteryState) {
    case BatteryState.UNKNOWN:
      return "bg--warn";

    case BatteryState.FULL:
      return "bg--good";

    case BatteryState.LOW:
      return "bg--warn";

    case BatteryState.CRITICAL:
      return "bg--bad";

    default:
      return assertUnreachable(batteryState, "got unexpected battery state");
  }
}

export default BatteryStatus;
