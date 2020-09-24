import React from "react";
import { useRecoilValue } from "recoil";
import { motorsConnectedState } from "../../state/motorsConnectedState";
import { targetSpeedsState, TargetSpeedsState } from "../../state/targetSpeedsState";
import { ReactComponent as MotorsIcon } from "../../theme/icons/motors-icon.svg";
import { Status, StateStatus } from "../Status/Status";

export const MotorsStatus: React.FC = () => {
  const motorsConnected = useRecoilValue(motorsConnectedState);
  const targetSpeeds = useRecoilValue(targetSpeedsState);

  return (
    <Status
      title="Motors"
      description={getMotorsDescription(motorsConnected, targetSpeeds)}
      status={getMotorsStatus(motorsConnected)}
      icon={<MotorsIcon />}
    />
  );
};

export function getMotorsDescription(motorsConnected: boolean, targetSpeeds: TargetSpeedsState): string {
  if (!motorsConnected) {
    return "Not connected";
  }

  return `${targetSpeeds.left} / ${targetSpeeds.right}`;
}

export function getMotorsStatus(motorsConnected: boolean): StateStatus {
  if (!motorsConnected) {
    return "error";
  }

  return "good";
}
