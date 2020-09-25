import React from "react";
import { useRecoilValue } from "recoil";
import { aliveState } from "../../state/aliveState";
import { motorsConnectedState } from "../../state/motorsConnectedState";
import { targetSpeedsState } from "../../state/targetSpeedsState";
import { ReactComponent as MotorsIcon } from "../../theme/icons/motors-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

export const MotorsStatus: React.FC<FlexProps> = ({ ...rest }) => {
  const isAlive = useRecoilValue(aliveState);
  const motorsConnected = useRecoilValue(motorsConnectedState);
  const targetSpeeds = useRecoilValue(targetSpeedsState);

  const getMotorsDescription = () => {
    if (!isAlive) {
      return "Offline";
    }

    if (!motorsConnected) {
      return "Not connected";
    }

    if (targetSpeeds.left === 0 && targetSpeeds.right === 0) {
      return "Stopped";
    }

    return `${targetSpeeds.left} / ${targetSpeeds.right}`;
  };

  const getMotorsStatus = (): StateStatus => {
    if (isAlive && motorsConnected) {
      return "good";
    }

    return "error";
  };

  return (
    <Status
      title="Motors"
      description={getMotorsDescription()}
      status={getMotorsStatus()}
      icon={<MotorsIcon />}
      {...rest}
    />
  );
};
