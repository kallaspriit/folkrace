import React, { useState, useCallback } from "react";
import { useRecoilValue } from "recoil";
import { useRemoteControl } from "../../hooks/useRemoteControl";
import { aliveState } from "../../state/aliveState";
import { motorsConnectedState } from "../../state/motorsConnectedState";
import { targetMotorRpmsState } from "../../state/targetMotorRpmsState";
import { ReactComponent as MotorsIcon } from "../../theme/icons/motors-icon.svg";
import { ReactComponent as RemoteIcon } from "../../theme/icons/remote-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

export const MotorsStatus: React.FC<FlexProps> = ({ onClick, ...rest }) => {
  const [isRemoteControlMode, setIsRemoteControlMode] = useState(false);
  const isAlive = useRecoilValue(aliveState);
  const motorsConnected = useRecoilValue(motorsConnectedState);
  const targetMotorRpms = useRecoilValue(targetMotorRpmsState);
  const { gamepadName } = useRemoteControl(isRemoteControlMode);

  const getTitle = () => {
    if (isRemoteControlMode) {
      return "Remote control";
    }

    return "Motors";
  };

  const getDescription = () => {
    if (!isAlive) {
      return "Offline";
    }

    if (!motorsConnected) {
      return "Not connected";
    }

    if (isRemoteControlMode && !gamepadName) {
      return "No controller";
    }

    if (targetMotorRpms.left === 0 && targetMotorRpms.right === 0) {
      return "Stopped";
    }

    return `${targetMotorRpms.left.toFixed(0)} / ${targetMotorRpms.right.toFixed(0)} RPM`;
  };

  const getStatus = (): StateStatus => {
    if (isRemoteControlMode && !gamepadName) {
      return "warn";
    }

    if (isAlive && motorsConnected) {
      return "good";
    }

    return "error";
  };

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      setIsRemoteControlMode(!isRemoteControlMode);

      // pass on click event
      if (onClick) {
        onClick(e);
      }
    },
    [isRemoteControlMode, onClick],
  );

  return (
    <Status
      title={getTitle()}
      description={getDescription()}
      status={getStatus()}
      icon={isRemoteControlMode ? <RemoteIcon /> : <MotorsIcon />}
      onClick={handleClick}
      {...rest}
    />
  );
};
