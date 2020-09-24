import React from "react";
import { useRecoilValue } from "recoil";
import { motorsConnectedState } from "../../state/motorsConnectedState";
import { targetSpeedsState, TargetSpeedsState } from "../../state/targetSpeedsState";
import { ReactComponent as MotorsIcon } from "../../theme/icons/motors-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

export const MotorsStatus: React.FC<FlexProps> = ({ ...rest }) => {
  const motorsConnected = useRecoilValue(motorsConnectedState);
  const targetSpeeds = useRecoilValue(targetSpeedsState);

  return (
    <Status
      title="Motors"
      description={getMotorsDescription(motorsConnected, targetSpeeds)}
      status={getMotorsStatus(motorsConnected)}
      icon={<MotorsIcon />}
      {...rest}
    />
  );
};

export function getMotorsDescription(motorsConnected: boolean, targetSpeeds: TargetSpeedsState): string {
  if (!motorsConnected) {
    return "Not connected";
  }

  if (targetSpeeds.left === 0 && targetSpeeds.right === 0) {
    return "Stopped";
  }

  return `${targetSpeeds.left} / ${targetSpeeds.right}`;
}

export function getMotorsStatus(motorsConnected: boolean): StateStatus {
  if (!motorsConnected) {
    return "error";
  }

  return "good";
}
