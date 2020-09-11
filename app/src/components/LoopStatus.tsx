import React from "react";
import { Subscribe } from "unstated";
import { LoopIcon } from "./Icon";

import { StatusContainer } from "../containers/StatusContainer";

import { Cell, CellStatus } from "./Grid";
import { Text } from "./Text";

export const LoopStatus: React.SFC = () => (
  <Subscribe to={[StatusContainer]}>
    {(status: StatusContainer) => {
      const { loopFrequency, loadPercentage } = status.state;
      const isStateKnown =
        loopFrequency !== undefined && loadPercentage !== undefined;
      const isValidLoopFrequency =
        loopFrequency !== undefined && Math.abs(100 - loopFrequency) < 10;
      const isValidLoad = loadPercentage !== undefined && loadPercentage < 100;
      const isSystemOptimal = isValidLoopFrequency && isValidLoad;
      const cellStatus = isSystemOptimal ? CellStatus.GOOD : CellStatus.WARN;
      const title =
        loopFrequency !== undefined && loadPercentage !== undefined
          ? `FPS: ${Math.ceil(loopFrequency)}, load: ${Math.round(
              loadPercentage
            )}%`
          : "Main thread";
      const description = !isStateKnown
        ? "Unknown"
        : isSystemOptimal
        ? "Systems optimal"
        : !isValidLoad
        ? "Overloaded"
        : "Invalid update rate";

      return (
        <Cell status={cellStatus}>
          <LoopIcon />
          <Text primary>{title}</Text>
          <Text>{description}</Text>
        </Cell>
      );
    }}
  </Subscribe>
);
