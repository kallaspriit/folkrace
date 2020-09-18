import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router";
import { BlockButton } from "../../components/BlockButton/BlockButton";
import { Column } from "../../components/Column/Column";
import { Expanded } from "../../components/Expanded/Expanded";
import { Field } from "../../components/Field/Field";
import { Form } from "../../components/Form/Form";
import { GridBox } from "../../components/GridBox/GridBox";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { ReactComponent as ConnectionIcon } from "../../theme/icons/connection-icon.svg";

interface ConnectionFormValues {
  websocketHost: string;
}

export const ConfigureConnectionView: React.FC = () => {
  const history = useHistory();

  const { register, handleSubmit, errors } = useForm<ConnectionFormValues>();

  const onSubmit = (data: ConnectionFormValues) => {
    console.log("onSubmit", data);
  };

  return (
    <View>
      <TitleBar onBack={() => history.replace("/")} title="Configure connection" />
      <Column scrollable padded expanded debug>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <Field
            type="text"
            name="websocketHost"
            label="Websocket host"
            leading={<ConnectionIcon />}
            error={errors.websocketHost}
            register={register({ required: "Hostname is required" })}
          />
          <GridBox size={3} />
          <Expanded />
          <BlockButton type="submit" onClick={handleSubmit(onSubmit)}>
            Update remote host
          </BlockButton>
        </Form>
      </Column>
    </View>
  );
};
