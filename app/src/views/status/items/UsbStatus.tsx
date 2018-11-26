import * as React from "react";
import { Subscribe } from "unstated";
import StatusContainer, {
  SerialType
} from "../../../containers/StatusContainer";
import { GridItem } from "../../../components/grid/Grid";
import classNames from "classnames";
import titleCase from "title-case";

const UsbStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(statusContainer: StatusContainer) => {
      const connectedSerial = statusContainer.getConnectedSerial();

      return (
        <GridItem
          className={classNames(
            "grid-status",
            connectedSerial !== undefined ? "bg--good" : "bg--bad"
          )}
        >
          <div className="grid__icon">
            <i
              className={
                connectedSerial && connectedSerial.type === SerialType.BLUETOOTH
                  ? "icon icon__bluetooth"
                  : "icon icon__serial"
              }
            />
          </div>
          <div className="grid__text">
            <div className="grid__text--primary">
              {connectedSerial ? connectedSerial.type : "Serial"}
            </div>
            <div className="grid__text--secondary">
              {titleCase(
                connectedSerial ? connectedSerial.state : "Disconnected"
              )}
              {connectedSerial && connectedSerial.deviceName
                ? `: ${connectedSerial.deviceName}`
                : ""}
            </div>
          </div>
        </GridItem>
      );
    }}
  </Subscribe>
);

export default UsbStatus;
