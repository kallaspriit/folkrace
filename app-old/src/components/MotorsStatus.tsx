import React from "react";
import { Subscribe } from "unstated";
import { MotorIcon } from "./Icon";

import { StatusContainer } from "../containers/StatusContainer";

import { Cell, CellStatus } from "./Grid";
import { Text } from "./Text";

export const MotorsStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(status: StatusContainer) => {
      const isMotorsCommunicationWorking = status.isMotorsCommunicationWorking();
      const cellStatus = isMotorsCommunicationWorking
        ? CellStatus.GOOD
        : CellStatus.BAD;
      const description = isMotorsCommunicationWorking
        ? "Connected"
        : "Offline";

      return (
        <Cell status={cellStatus}>
          <MotorIcon />
          <Text primary>Motors</Text>
          <Text>{description}</Text>
        </Cell>
      );
    }}
  </Subscribe>
);
