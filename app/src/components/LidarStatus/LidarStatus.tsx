import React from "react";
import { useRecoilValue } from "recoil";
import { aliveState } from "../../state/aliveState";
import { lidarStatusState } from "../../state/lidarStatusState";
import { ReactComponent as LidarIcon } from "../../theme/icons/lidar-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

export const LidarStatus: React.FC<FlexProps> = ({ ...rest }) => {
  const isAlive = useRecoilValue(aliveState);
  const lidarStatus = useRecoilValue(lidarStatusState);

  const getLidarDescription = (): string => {
    if (!isAlive) {
      return "Offline";
    }

    if (!lidarStatus) {
      return "Not available";
    }

    if (!lidarStatus.isRunning) {
      return "Stopped";
    } else if (!lidarStatus.isValid) {
      return "Not valid";
    }

    return `${lidarStatus.currentRpm} / ${lidarStatus.targetRpm} RPM`;
  };

  const getLidarStatus = (): StateStatus => {
    if (!lidarStatus || !isAlive) {
      return "error";
    }

    if (!lidarStatus.isRunning) {
      return "good";
    }

    if (lidarStatus.isRunning && lidarStatus.isValid) {
      return "good";
    }

    if (lidarStatus.isRunning && !lidarStatus.isValid) {
      return "warn";
    }

    return "error";
  };

  return (
    <Status
      title="Lidar"
      description={getLidarDescription()}
      status={getLidarStatus()}
      icon={<LidarIcon />}
      {...rest}
    />
  );
};
