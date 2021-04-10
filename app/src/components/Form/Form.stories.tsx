import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ReactComponent as EmailIcon } from "../../theme/icons/email-icon.svg";
import { ReactComponent as PasswordIcon } from "../../theme/icons/password-icon.svg";
import { validateEmail } from "../../validators/validateEmail";
import { validateMinimumLength } from "../../validators/validateMinimumLength";
import { BlockButton } from "../BlockButton/BlockButton";
import { Debug } from "../Debug/Debug";
import { Field } from "../Field/Field";
import { Form } from "../Form/Form";
import { GridBox } from "../GridBox/GridBox";

export default {
  title: "Form",
  component: Form,
};

interface LoginFormValues {
  email: string;
  password: string;
}

export const Example = () => {
  const { register, handleSubmit, formState } = useForm<LoginFormValues>();
  const [submittedData, setSubmittedData] = useState<LoginFormValues | undefined>(undefined);

  const onSubmit = (data: LoginFormValues) => {
    setSubmittedData(data);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Field
        type="email"
        label="Email"
        leading={<EmailIcon />}
        error={formState.errors.email}
        register={register("email", { required: "Email is required", validate: validateEmail })}
      />
      <Field
        type="password"
        label="Password"
        leading={<PasswordIcon />}
        error={formState.errors.password}
        register={register("password", { validate: validateMinimumLength(8) })}
      />
      <GridBox half />
      <BlockButton inline tertiary type="submit" onClick={handleSubmit(onSubmit)}>
        Log In
      </BlockButton>
      <Debug title="Form" omit={["ref"]}>
        {{ submittedData, formState }}
      </Debug>
    </Form>
  );
};
