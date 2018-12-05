import { SerialState, SerialType } from "../containers/StatusContainer";
import { robot } from "../services/robot";

import { ContainerMap } from "./";

export async function handleSerialCommand(
  args: string[],
  { status }: ContainerMap
) {
  // extract serial info
  const serialType = args[0] as SerialType;
  const serialState = args[1] as SerialState;
  const serialDeviceName = typeof args[2] === "string" ? args[2] : undefined;

  // update serial state
  await status.setSerialState(serialType, serialState, serialDeviceName);

  const connectedSerial = status.getConnectedSerial();

  // ask for some initial state info once a serial connection is established
  if (connectedSerial !== undefined && serialType === connectedSerial.type) {
    // request current state
    robot.requestState();

    // also setup an interval to ask the voltage level periodically
    // requestBatteryVoltageInterval = window.setInterval(() => {
    //   requestVoltage();
    // }, REQUEST_BATTERY_VOLTAGE_INTERVAL);
  } else {
    // clear the battery voltage interval if exists
    // if (requestBatteryVoltageInterval !== null) {
    //   window.clearInterval(requestBatteryVoltageInterval);

    //   requestBatteryVoltageInterval = null;
    // }

    // no serial connection so we can't be sure of battery voltage
    void status.setBatteryVoltage(undefined);
  }
}
