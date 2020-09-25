import React from "react";
import { useHistory } from "react-router";
import { Column } from "../../components/Column/Column";
import { Flex } from "../../components/Flex/Flex";
import { NameValuePair } from "../../components/NameValuePair/NameValuePair";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { useRemoteControl } from "../../hooks/useRemoteControl";

export const RemoteView: React.FC = () => {
  const history = useHistory();
  const { gamepadName } = useRemoteControl();

  return (
    <Flex cover>
      <TitleBar title="Remote controller" onBack={() => history.goBack()} />
      <Column expanded scrollable padded compact>
        <NameValuePair vertical name="Controller">
          {gamepadName ?? "No gamepad available"}
        </NameValuePair>
      </Column>
    </Flex>
  );
};
