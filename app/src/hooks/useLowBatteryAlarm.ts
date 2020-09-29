import { useRecoilValue } from "recoil";
import useSound from "use-sound";
import { config } from "../config";
import { aliveState } from "../state/aliveState";
import { voltageState } from "../state/voltageState";
import { useInterval } from "./useInterval";

export function useLowBatteryAlarm() {
  const isAlive = useRecoilValue(aliveState);
  const batteryVoltage = useRecoilValue(voltageState);
  const isBatteryCritical = isAlive && batteryVoltage !== undefined && batteryVoltage <= config.battery.critical;
  const [play] = useSound("/sounds/low-battery.mp3");

  useInterval(() => {
    if (!isBatteryCritical) {
      return;
    }

    play();
  }, config.battery.alarmInterval);
}
