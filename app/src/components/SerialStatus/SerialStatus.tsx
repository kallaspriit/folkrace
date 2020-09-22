import React from "react";
import { useRecoilValue } from "recoil";
import { getSerialStatusName } from "../../services/getSerialStatusName";
import { getSerialStatusStateStatus } from "../../services/getSerialStatusStateStatus";
import { serialStatusState } from "../../state/serialStatusState";
import { ReactComponent as SerialIcon } from "../../theme/icons/serial-icon.svg";
import { Status } from "../Status/Status";

export const SerialStatus: React.FC = () => {
  const serialStatus = useRecoilValue(serialStatusState);

  return (
    <Status
      title="Serial"
      description={getSerialStatusName(serialStatus)}
      status={getSerialStatusStateStatus(serialStatus)}
      icon={<SerialIcon />}
    />
  );
};
