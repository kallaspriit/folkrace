import { StateStatus } from "../components/Status/Status";
import { TransportStatus } from "../lib/transport";
import { assertUnreachable } from "./assertUnreachable";

export function getTransportStatusStateStatus(transportStatus: TransportStatus): StateStatus {
  switch (transportStatus) {
    case TransportStatus.DISCONNECTED:
      return "error";

    case TransportStatus.CONNECTING:
      return "warn";

    case TransportStatus.RECONNECTING:
      return "warn";

    case TransportStatus.CONNECTED:
      return "good";

    default:
      return assertUnreachable(
        transportStatus,
        `Unexpected transport status "${transportStatus}" not handled, this should not happen`,
      );
  }
}
