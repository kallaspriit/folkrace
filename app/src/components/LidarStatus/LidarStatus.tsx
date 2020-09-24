import React from "react";
import { useRecoilValue } from "recoil";
import { lidarStatusState, LidarStatus as LidarStatusInfo } from "../../state/lidarStatusState";
import { ReactComponent as LidarIcon } from "../../theme/icons/lidar-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

export const LidarStatus: React.FC<FlexProps> = ({ ...rest }) => {
  const lidarStatus = useRecoilValue(lidarStatusState);

  return (
    <Status
      title="Lidar"
      description={getLidarDescription(lidarStatus)}
      status={getLidarStatus(lidarStatus)}
      icon={<LidarIcon />}
      {...rest}
    />
  );
};

export function getLidarDescription(lidarStatus: LidarStatusInfo | undefined): string {
  if (!lidarStatus) {
    return "Not available";
  }

  if (!lidarStatus.isRunning) {
    return "Stopped";
  } else if (!lidarStatus.isValid) {
    return "Not valid";
  }

  return `${lidarStatus.currentRpm} / ${lidarStatus.targetRpm} RPM`;
}

export function getLidarStatus(lidarStatus: LidarStatusInfo | undefined): StateStatus {
  if (!lidarStatus) {
    return "error";
  }

  if (lidarStatus.isRunning && !lidarStatus.isValid) {
    return "warn";
  }

  return "good";
}
