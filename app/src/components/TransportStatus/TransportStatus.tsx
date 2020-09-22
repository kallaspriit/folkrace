import React from "react";
import { useRecoilValue } from "recoil";
import { TransportStatus as TransportStatusEnum } from "../../lib/transport";
import { getTransportStatusName } from "../../services/getTransportStatusName";
import { getTransportStatusStateStatus } from "../../services/getTransportStatusStateStatus";
import { activeTransportNameState } from "../../state/activeTransportNameState";
import { serverIpState } from "../../state/serverIpState";
import { transportStatusState } from "../../state/transportStatusState";
import { ReactComponent as TransportIcon } from "../../theme/icons/transport-icon.svg";
import { Status } from "../Status/Status";

export const TransportStatus: React.FC = () => {
  const activeTransportName = useRecoilValue(activeTransportNameState);
  const transportStatus = useRecoilValue(transportStatusState);
  const serverIp = useRecoilValue(serverIpState);

  return (
    <Status
      title={activeTransportName ?? "Transport"}
      description={
        transportStatus === TransportStatusEnum.CONNECTED && serverIp
          ? serverIp
          : getTransportStatusName(transportStatus)
      }
      status={getTransportStatusStateStatus(transportStatus)}
      icon={<TransportIcon />}
    />
  );
};
