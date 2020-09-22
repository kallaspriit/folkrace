import { TransportStatus } from "../lib/transport";
import { assertUnreachable } from "./assertUnreachable";

export function getTransportStatusName(transportStatus: TransportStatus): string {
  switch (transportStatus) {
    case TransportStatus.DISCONNECTED:
      return "Disconnected";

    case TransportStatus.CONNECTING:
      return "Connecting";

    case TransportStatus.RECONNECTING:
      return "Reconnecting";

    case TransportStatus.CONNECTED:
      return "Connected";

    default:
      return assertUnreachable(
        transportStatus,
        `Unexpected transport status "${transportStatus}" not handled, this should not happen`,
      );
  }
}
