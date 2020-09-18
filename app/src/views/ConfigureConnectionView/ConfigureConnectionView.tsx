import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { BlockButton } from "../../components/BlockButton/BlockButton";
import { Expanded } from "../../components/Expanded/Expanded";
import { Field } from "../../components/Field/Field";
import { Form } from "../../components/Form/Form";
import { GridBox } from "../../components/GridBox/GridBox";
import { NameValuePair } from "../../components/NameValuePair/NameValuePair";
import { TextButton } from "../../components/TextButton/TextButton";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { MainMenuViewParams, MAIN_MENU_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { storeWebsocketHost } from "../../services/storeWebsocketHost";
import { transportStatusState } from "../../state/transportStatusState";
import { websocketHostState } from "../../state/websocketHostState";
import { ReactComponent as NetworkIcon } from "../../theme/icons/network-icon.svg";
import { ReactComponent as TickIcon } from "../../theme/icons/tick-icon.svg";
import styles from "./ConfigureConnectionView.module.scss";

interface ConnectionFormValues {
  websocketHost: string;
}

export const ConfigureConnectionView: React.FC = () => {
  const history = useHistory();
  const [isHostUpdated, setIsHostUpdated] = useState(false);
  const transportStatus = useRecoilValue(transportStatusState);
  const [websocketHost, setWebsocketHost] = useRecoilState(websocketHostState);
  const { register, handleSubmit, errors } = useForm<ConnectionFormValues>();

  const onSubmit = ({ websocketHost }: ConnectionFormValues) => {
    // update state, store the new setting, mark updated
    setWebsocketHost(websocketHost);
    storeWebsocketHost(websocketHost);
    setIsHostUpdated(true);
  };

  return (
    <View>
      <TitleBar
        onBack={() => (history.length > 0 ? history.goBack() : history.replace("/"))}
        title="Configure connection"
      />
      <Form scrollable padded expanded onSubmit={handleSubmit(onSubmit)}>
        <Field
          type="text"
          name="websocketHost"
          label="Websocket host"
          defaultValue={websocketHost}
          leading={<NetworkIcon className={styles.icon} />}
          trailing={isHostUpdated && <TickIcon />}
          onChange={() => setIsHostUpdated(false)}
          error={errors.websocketHost}
          register={register({ required: "Hostname is required" })}
        />
        <GridBox half />
        <NameValuePair name="Transport status" value={transportStatus} />
        <GridBox half />
        <Expanded />
        <BlockButton type="submit" onClick={handleSubmit(onSubmit)}>
          Update remote host
        </BlockButton>
        <GridBox />
        <TextButton onClick={() => history.push(buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH))}>
          Continue
        </TextButton>
      </Form>
    </View>
  );
};
