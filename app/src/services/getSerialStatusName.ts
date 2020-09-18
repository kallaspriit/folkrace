import { SerialStatus } from "../state/serialStatusState";
import { assertUnreachable } from "./assertUnreachable";

export function getSerialStatusName(serialStatus: SerialStatus): string {
  switch (serialStatus) {
    case SerialStatus.CONNECTING:
      return "Connecting";

    case SerialStatus.CONNECTED:
      return "Connected";

    case SerialStatus.DISCONNECTED:
      return "Disconnected";

    case SerialStatus.NOT_SUPPORTED:
      return "Not supported";

    case SerialStatus.DEVICE_NOT_FOUND:
      return "Not found";

    case SerialStatus.DISABLED:
      return "Disabled";

    default:
      return assertUnreachable(
        serialStatus,
        `Unexpected serial status "${serialStatus}" not handled, this should not happen`,
      );
  }
}
