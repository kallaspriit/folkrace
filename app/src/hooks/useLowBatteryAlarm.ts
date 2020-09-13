import { useRecoilValue } from "recoil";
import useSound from "use-sound";
import { config } from "../config";
import { voltageState } from "../state/voltageState";
import { useInterval } from "./useInterval";

export function useLowBatteryAlarm() {
  const batteryVoltage = useRecoilValue(voltageState);
  const isBatteryCritical = batteryVoltage !== undefined && batteryVoltage <= config.rules.battery.critical;
  const [play] = useSound("/sounds/low-battery.mp3");

  useInterval(() => {
    if (!isBatteryCritical) {
      return;
    }

    play();
  }, config.rules.battery.alarmInterval);
}
