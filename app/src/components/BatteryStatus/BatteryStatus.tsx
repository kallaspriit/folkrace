import React from "react";
import { useRecoilValue } from "recoil";
import { config } from "../../config";
import { aliveState } from "../../state/aliveState";
import { voltageState } from "../../state/voltageState";
import { ReactComponent as BatteryIcon } from "../../theme/icons/battery-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

export const BatteryStatus: React.FC<FlexProps> = ({ ...rest }) => {
  const isAlive = useRecoilValue(aliveState);
  const voltage = useRecoilValue(voltageState);

  const getBatteryTitle = () => {
    if (isAlive && voltage !== undefined) {
      if (voltage < config.battery.critical) {
        return "Battery critical";
      } else if (voltage < config.battery.low) {
        return "Battery low";
      }
    }

    return "Battery";
  };

  const getBatteryDescription = () => {
    if (!isAlive) {
      return "Offline";
    } else if (voltage === undefined) {
      return "Unknown";
    }

    return `${voltage.toFixed(1)}V`;
  };

  const getBatteryStatus = (): StateStatus => {
    if (!isAlive) {
      return "error";
    } else if (voltage === undefined) {
      return "warn";
    } else if (voltage < config.battery.critical) {
      return "error";
    } else if (voltage < config.battery.low) {
      return "warn";
    }

    return "good";
  };

  return (
    <Status
      title={getBatteryTitle()}
      description={getBatteryDescription()}
      status={getBatteryStatus()}
      icon={<BatteryIcon />}
      {...rest}
    />
  );
};
