import React from "react";
import { useRecoilValue } from "recoil";
import { aliveState } from "../../state/aliveState";
import { loadState } from "../../state/loadState";
import { loopFrequencyState } from "../../state/loopFrequencyState";
import { motorsConnectedState } from "../../state/motorsConnectedState";
import { ReactComponent as FirmwareIcon } from "../../theme/icons/serial-icon.svg";
import { FlexProps } from "../Flex/Flex";
import { Status, StateStatus } from "../Status/Status";

export const FirmwareStatus: React.FC<FlexProps> = ({ ...rest }) => {
  const isAlive = useRecoilValue(aliveState);
  const areMotorsConnected = useRecoilValue(motorsConnectedState);
  const load = useRecoilValue(loadState);
  const loopFrequency = useRecoilValue(loopFrequencyState);

  const getFirmwareDescription = () => {
    if (!isAlive) {
      return "Not responsive";
    } else if (!areMotorsConnected) {
      return "Motors offline";
    }

    if (load === undefined || loopFrequency === undefined) {
      return "Online";
    }

    return `${Math.round(load)}% / ${loopFrequency}Hz`;
  };

  const getFirmwareStatus = (): StateStatus => {
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
  };

  return (
    <Status
      title="Firmware"
      description={getFirmwareDescription()}
      status={getFirmwareStatus()}
      icon={<FirmwareIcon />}
      {...rest}
    />
  );
};
