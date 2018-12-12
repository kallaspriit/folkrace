import { AhrsContainer } from "../containers/AhrsContainer";
import { ButtonContainer } from "../containers/ButtonContainer";
import { LidarContainer } from "../containers/LidarContainer";
import { LogContainer } from "../containers/LogContainer";
import { MeasurementsContainer } from "../containers/MeasurementsContainer";
import { OdometryContainer } from "../containers/OdometryContainer";
import { RobotContainer } from "../containers/RobotContainer";
import { StatusContainer } from "../containers/StatusContainer";

export interface ContainerMap {
  log: LogContainer;
  status: StatusContainer;
  odometry: OdometryContainer;
  lidar: LidarContainer;
  button: ButtonContainer;
  robot: RobotContainer;
  measurements: MeasurementsContainer;
  ahrs: AhrsContainer;
}

// initial lie
export const containers: ContainerMap = {} as ContainerMap;

// updates the containers to use
export function setContainers(newContainers: ContainerMap) {
  Object.keys(newContainers).forEach(key => {
    const containerName = key as keyof ContainerMap;

    containers[containerName] = newContainers[containerName];
  });
}
