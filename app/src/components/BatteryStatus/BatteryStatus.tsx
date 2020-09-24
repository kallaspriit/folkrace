import React from "react";
import { useRecoilValue } from "recoil";
import { config } from "../../config";
import { aliveState } from "../../state/aliveState";
import { voltageState } from "../../state/voltageState";
import { ReactComponent as BatteryIcon } from "../../theme/icons/battery-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

interface BatteryInfo {
  isAlive: boolean;
  voltage: number | undefined;
}

export const BatteryStatus: React.FC<FlexProps> = ({ ...rest }) => {
  const isAlive = useRecoilValue(aliveState);
  const voltage = useRecoilValue(voltageState);

  const batteryInfo: BatteryInfo = {
    isAlive,
    voltage,
  };

  return (
    <Status
      title={getBatteryTitle(batteryInfo)}
      description={getBatteryDescription(batteryInfo)}
      status={getBatteryStatus(batteryInfo)}
      icon={<BatteryIcon />}
      {...rest}
    />
  );
};

function getBatteryTitle({ isAlive, voltage }: BatteryInfo) {
  if (isAlive && voltage !== undefined) {
    if (voltage < config.rules.battery.critical) {
      return "Battery critical";
    } else if (voltage < config.rules.battery.low) {
      return "Battery low";
    }
  }

  return "Battery";
}

function getBatteryDescription({ isAlive, voltage }: BatteryInfo) {
  if (!isAlive) {
    return "Not available";
  } else if (voltage === undefined) {
    return "Unknown";
  }

  return `${voltage.toFixed(1)}V`;
}

function getBatteryStatus({ isAlive, voltage }: BatteryInfo): StateStatus {
  if (!isAlive) {
    return "error";
  } else if (voltage === undefined) {
    return "warn";
  } else if (voltage < config.rules.battery.critical) {
    return "error";
  } else if (voltage < config.rules.battery.low) {
    return "warn";
  }

  return "good";
}
