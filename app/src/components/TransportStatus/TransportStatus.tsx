import React from "react";
import { useRecoilValue } from "recoil";
import { TransportStatus as TransportStatusEnum } from "../../lib/transport";
import { assertUnreachable } from "../../services/assertUnreachable";
import { activeTransportNameState } from "../../state/activeTransportNameState";
import { serverIpState } from "../../state/serverIpState";
import { transportStatusState } from "../../state/transportStatusState";
import { ReactComponent as TransportIcon } from "../../theme/icons/transport-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

export const TransportStatus: React.FC<FlexProps> = ({ ...rest }) => {
  const activeTransportName = useRecoilValue(activeTransportNameState);
  const transportStatus = useRecoilValue(transportStatusState);
  const serverIp = useRecoilValue(serverIpState);

  return (
    <Status
      title={activeTransportName ?? "Transport"}
      description={getTransportDescription(transportStatus, serverIp)}
      status={getTransportStatus(transportStatus)}
      icon={<TransportIcon />}
      {...rest}
    />
  );
};

export function getTransportDescription(transportStatus: TransportStatusEnum, serverIp: string | undefined): string {
  if (transportStatus === TransportStatusEnum.CONNECTED && serverIp !== undefined) {
    return serverIp;
  }

  switch (transportStatus) {
    case TransportStatusEnum.DISCONNECTED:
      return "Disconnected";

    case TransportStatusEnum.CONNECTING:
      return "Connecting";

    case TransportStatusEnum.RECONNECTING:
      return "Reconnecting";

    case TransportStatusEnum.CONNECTED:
      return "Connected";

    default:
      return assertUnreachable(
        transportStatus,
        `Unexpected transport status "${transportStatus}" not handled, this should not happen`,
      );
  }
}

export function getTransportStatus(transportStatus: TransportStatusEnum): StateStatus {
  switch (transportStatus) {
    case TransportStatusEnum.DISCONNECTED:
      return "error";

    case TransportStatusEnum.CONNECTING:
      return "warn";

    case TransportStatusEnum.RECONNECTING:
      return "warn";

    case TransportStatusEnum.CONNECTED:
      return "good";

    default:
      return assertUnreachable(
        transportStatus,
        `Unexpected transport status "${transportStatus}" not handled, this should not happen`,
      );
  }
}
