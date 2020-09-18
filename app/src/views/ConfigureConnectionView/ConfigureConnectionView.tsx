import React from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";
import { useRecoilState, useRecoilValue } from "recoil";
import { BlockButton } from "../../components/BlockButton/BlockButton";
import { Expanded } from "../../components/Expanded/Expanded";
import { Field } from "../../components/Field/Field";
import { Form } from "../../components/Form/Form";
import { GridBox } from "../../components/GridBox/GridBox";
import { NameValuePair } from "../../components/NameValuePair/NameValuePair";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { storeWebsocketHost } from "../../services/storeWebsocketHost";
import { transportStatusState } from "../../state/transportStatusState";
import { websocketHostState } from "../../state/websocketHostState";
import { ReactComponent as NetworkIcon } from "../../theme/icons/network-icon.svg";
import styles from "./ConfigureConnectionView.module.scss";

interface ConnectionFormValues {
  websocketHost: string;
}

export const ConfigureConnectionView: React.FC = () => {
  const history = useHistory();
  const transportStatus = useRecoilValue(transportStatusState);
  const [websocketHost, setWebsocketHost] = useRecoilState(websocketHostState);
  const { register, handleSubmit, errors } = useForm<ConnectionFormValues>();

  const onSubmit = ({ websocketHost }: ConnectionFormValues) => {
    // update state
    setWebsocketHost(websocketHost);

    // store the new setting
    storeWebsocketHost(websocketHost);
  };

  return (
    <View>
      <TitleBar onBack={() => history.goBack()} title="Configure connection" />
      <Form scrollable padded expanded onSubmit={handleSubmit(onSubmit)}>
        <Field
          type="text"
          name="websocketHost"
          label="Websocket host"
          defaultValue={websocketHost}
          leading={<NetworkIcon className={styles.icon} />}
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
      </Form>
    </View>
  );
};
