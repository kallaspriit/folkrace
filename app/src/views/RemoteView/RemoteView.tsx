import React from "react";
import { useHistory } from "react-router";
import { useRecoilValue } from "recoil";
import { Column } from "../../components/Column/Column";
import { Flex } from "../../components/Flex/Flex";
import { GridBox } from "../../components/GridBox/GridBox";
import { NameValuePair } from "../../components/NameValuePair/NameValuePair";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { useRemoteControl } from "../../hooks/useRemoteControl";
import { currentMotorRpmsState } from "../../state/currentMotorRpmsState";
import { currentSpeedsState } from "../../state/currentSpeedsState";
import { targetMotorRpmsState } from "../../state/targetMotorRpmsState";
import { targetSpeedsState } from "../../state/targetSpeedsState";

export const RemoteView: React.FC = () => {
  const history = useHistory();
  const { gamepadName } = useRemoteControl();
  const currentSpeeds = useRecoilValue(currentSpeedsState);
  const targetSpeeds = useRecoilValue(targetSpeedsState);
  const currentMotorRpms = useRecoilValue(currentMotorRpmsState);
  const targetMotorRpms = useRecoilValue(targetMotorRpmsState);

  return (
    <Flex cover>
      <TitleBar title="Remote controller" onBack={() => history.goBack()} />
      <Column expanded scrollable padded compact>
        <NameValuePair vertical name="Controller">
          {gamepadName ?? "No gamepad available"}
        </NameValuePair>
        <GridBox size={3} />
        <NameValuePair name="Left speed">
          {Math.round(currentSpeeds.left)} / {targetSpeeds.left} QPPS
        </NameValuePair>
        <NameValuePair name="Right speed">
          {currentSpeeds.right.toFixed(0)} / {targetSpeeds.right} QPPS
        </NameValuePair>
        <NameValuePair name="Left RPM">
          {currentMotorRpms.left.toFixed(0)} / {targetMotorRpms.left.toFixed(0)} RPM
        </NameValuePair>
        <NameValuePair name="Right RPM">
          {currentMotorRpms.right.toFixed(0)} / {targetMotorRpms.right.toFixed(0)} RPM
        </NameValuePair>
      </Column>
    </Flex>
  );
};
