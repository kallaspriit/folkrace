import { useEffect, useState } from "react";
import { useRecoilValue } from "recoil";
import useSound from "use-sound";
import { config } from "../config";
import { voltageState } from "../state/voltageState";
import { useInterval } from "./useInterval";

export function useLowBatteryAlarm() {
  const batteryVoltage = useRecoilValue(voltageState);
  const isBatteryLow = batteryVoltage !== undefined && batteryVoltage <= config.rules.battery.low;
  const [play] = useSound("/sounds/low-battery.mp3");

  useInterval(() => {
    if (!isBatteryLow) {
      return;
    }

    play();
  }, config.rules.battery.alarmInterval);
}
