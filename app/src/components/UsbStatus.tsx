import * as React from "react";
import { Subscribe } from "unstated";
import StatusContainer, { SerialType } from "../containers/StatusContainer";
import { GridItem, GridItemStatus } from "./Grid";
import titleCase from "title-case";
import { StatusIcon, BluetoothIcon, SerialIcon } from "./Icon";
import { Text } from "./Text";

export const UsbStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(statusContainer: StatusContainer) => {
      const connectedSerial = statusContainer.getConnectedSerial();
      const status =
        connectedSerial !== undefined
          ? GridItemStatus.GOOD
          : GridItemStatus.BAD;
      const Icon =
        connectedSerial && connectedSerial.type === SerialType.BLUETOOTH
          ? BluetoothIcon
          : SerialIcon;
      const title = connectedSerial ? connectedSerial.type : "Serial";
      const description = titleCase(
        connectedSerial ? connectedSerial.state : "Disconnected"
      );

      return (
        <GridItem status={status}>
          <Icon />
          <Text primary>{title}</Text>
          <Text>{description}</Text>
        </GridItem>
      );
    }}
  </Subscribe>
);
