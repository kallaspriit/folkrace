import React from "react";
import { useRecoilValue } from "recoil";
import { aliveState } from "../../state/aliveState";
import { loadState } from "../../state/loadState";
import { loopFrequencyState } from "../../state/loopFrequencyState";
import { motorsConnectedState } from "../../state/motorsConnectedState";
import { ReactComponent as FirmwareIcon } from "../../theme/icons/serial-icon.svg";
import { Status, StateStatus } from "../Status/Status";

interface FirmwareInfo {
  isAlive: boolean;
  areMotorsConnected: boolean;
  load: number | undefined;
  loopFrequency: number | undefined;
}

export const FirmwareStatus: React.FC = () => {
  const isAlive = useRecoilValue(aliveState);
  const areMotorsConnected = useRecoilValue(motorsConnectedState);
  const load = useRecoilValue(loadState);
  const loopFrequency = useRecoilValue(loopFrequencyState);

  const firmwareInfo: FirmwareInfo = {
    isAlive,
    areMotorsConnected,
    load,
    loopFrequency,
  };

  return (
    <Status
      title="Firmware"
      description={getFirmwareDescription(firmwareInfo)}
      status={getFirmwareStatus(firmwareInfo)}
      icon={<FirmwareIcon />}
    />
  );
};

function getFirmwareDescription({ isAlive, areMotorsConnected, load, loopFrequency }: FirmwareInfo) {
  if (!isAlive) {
    return "Not responsive";
  } else if (!areMotorsConnected) {
    return "Motors offline";
  }

  if (load === undefined || loopFrequency === undefined) {
    return "Online";
  }

  return `${Math.round(load)}% / ${loopFrequency}Hz`;
}

function getFirmwareStatus({ isAlive, areMotorsConnected, load, loopFrequency }: FirmwareInfo): StateStatus {
  if (isAlive) {
    if (!areMotorsConnected) {
      return "warn";
    } else if (load !== undefined && load > 100) {
      return "warn";
    } else if (loopFrequency !== undefined && loopFrequency < 60) {
      return "warn";
    }

    return "good";
  }

  return "error";
}
