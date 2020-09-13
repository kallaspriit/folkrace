import { useRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { voltageState } from "../state/voltageState";

export function useHandleVoltageCommand() {
  const [, setVoltage] = useRecoilState(voltageState);

  return (args: string[]) => {
    assertArgumentCount(args, 1);

    // voltage is reported in 10ths of voltage (so 162 is 16.2 volts)
    const voltage = parseInt(args[0], 10) / 10.0;

    setVoltage(voltage);
  };
}
