import React from "react";
import { useRecoilValue } from "recoil";
import { assertUnreachable } from "../../services/assertUnreachable";
import { serialStatusState, SerialStatus as SerialStatusEnum } from "../../state/serialStatusState";
import { ReactComponent as SerialIcon } from "../../theme/icons/serial-icon.svg";
import { Status, StateStatus } from "../Status/Status";

export const SerialStatus: React.FC = () => {
  const serialStatus = useRecoilValue(serialStatusState);

  return (
    <Status
      title="Serial"
      description={getSerialDescription(serialStatus)}
      status={getSerialStatus(serialStatus)}
      icon={<SerialIcon />}
    />
  );
};

export function getSerialDescription(serialStatus: SerialStatusEnum): string {
  switch (serialStatus) {
    case SerialStatusEnum.CONNECTING:
      return "Connecting";

    case SerialStatusEnum.CONNECTED:
      return "Connected";

    case SerialStatusEnum.DISCONNECTED:
      return "Disconnected";

    case SerialStatusEnum.NOT_SUPPORTED:
      return "Not supported";

    case SerialStatusEnum.DEVICE_NOT_FOUND:
      return "Not found";

    case SerialStatusEnum.DISABLED:
      return "Disabled";

    default:
      return assertUnreachable(
        serialStatus,
        `Unexpected serial status "${serialStatus}" not handled, this should not happen`,
      );
  }
}

export function getSerialStatus(serialStatus: SerialStatusEnum): StateStatus {
  switch (serialStatus) {
    case SerialStatusEnum.CONNECTING:
      return "warn";

    case SerialStatusEnum.CONNECTED:
      return "good";

    case SerialStatusEnum.DISCONNECTED:
      return "error";

    case SerialStatusEnum.NOT_SUPPORTED:
      return "error";

    case SerialStatusEnum.DEVICE_NOT_FOUND:
      return "error";

    case SerialStatusEnum.DISABLED:
      return "error";

    default:
      return assertUnreachable(
        serialStatus,
        `Unexpected serial status "${serialStatus}" not handled, this should not happen`,
      );
  }
}
