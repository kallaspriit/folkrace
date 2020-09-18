import React from "react";
import { useLowBatteryAlarm } from "../../hooks/useLowBatteryAlarm";

export const LowBatteryAlarm: React.FC = () => {
  useLowBatteryAlarm();

  return null;
};
