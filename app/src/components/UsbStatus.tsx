import React from "react";
import titleCase from "title-case";
import { Subscribe } from "unstated";

import { SerialType, StatusContainer } from "../containers/StatusContainer";

import { Cell, CellStatus } from "./Grid";
import { BluetoothIcon, SerialIcon } from "./Icon";
import { Text } from "./Text";

export const UsbStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(status: StatusContainer) => {
      const connectedSerial = status.getConnectedSerial();
      const usbStatus =
        connectedSerial !== undefined ? CellStatus.GOOD : CellStatus.BAD;
      const Icon =
        connectedSerial && connectedSerial.type === SerialType.BLUETOOTH
          ? BluetoothIcon
          : SerialIcon;
      const title = connectedSerial ? connectedSerial.type : "Serial";
      const description = titleCase(
        connectedSerial ? connectedSerial.state : "Disconnected"
      );

      return (
        <Cell status={usbStatus}>
          <Icon />
          <Text primary>{title}</Text>
          <Text>{description}</Text>
        </Cell>
      );
    }}
  </Subscribe>
);
