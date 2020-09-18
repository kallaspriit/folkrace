import { StateStatus } from "../components/Status/Status";
import { SerialStatus } from "../state/serialStatusState";
import { assertUnreachable } from "./assertUnreachable";

export function getSerialStatusStateStatus(serialStatus: SerialStatus): StateStatus {
  switch (serialStatus) {
    case SerialStatus.CONNECTING:
      return "warn";

    case SerialStatus.CONNECTED:
      return "good";

    case SerialStatus.DISCONNECTED:
      return "error";

    case SerialStatus.NOT_SUPPORTED:
      return "error";

    case SerialStatus.DEVICE_NOT_FOUND:
      return "error";

    case SerialStatus.DISABLED:
      return "error";

    default:
      return assertUnreachable(
        serialStatus,
        `Unexpected serial status "${serialStatus}" not handled, this should not happen`,
      );
  }
}
