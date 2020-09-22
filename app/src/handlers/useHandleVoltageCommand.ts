import { useSetRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { voltageState } from "../state/voltageState";

export function useHandleVoltageCommand() {
  const setVoltage = useSetRecoilState(voltageState);

  // for example "voltage:162" means 16.2 volts
  return (args: string[]) => {
    assertArgumentCount(args, 1);

    // voltage is reported in 10ths of volts
    const voltage = parseInt(args[0], 10) / 10.0;

    setVoltage(voltage);
  };
}
