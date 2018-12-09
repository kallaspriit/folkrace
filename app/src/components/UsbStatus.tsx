import * as React from "react";
import titleCase from "title-case";
import { Subscribe } from "unstated";

import { SerialType, StatusContainer } from "../containers/StatusContainer";

import { GridItem, GridItemStatus } from "./Grid";
import { BluetoothIcon, SerialIcon } from "./Icon";
import { Text } from "./Text";

export const UsbStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(status: StatusContainer) => {
      const connectedSerial = status.getConnectedSerial();
      const usbStatus =
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
        <GridItem status={usbStatus}>
          <Icon />
          <Text primary>{title}</Text>
          <Text>{description}</Text>
        </GridItem>
      );
    }}
  </Subscribe>
);
