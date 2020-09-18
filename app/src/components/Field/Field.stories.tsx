import React from "react";
import { Field } from "./Field";

export default {
  title: "Field",
  component: Field,
};

export const Default = () => <Field name="email" label="Email" />;

export const WithError = () => (
  <Field name="email" label="Email" error={{ type: "validate", message: "Please provide valid email" }} />
);

export const WithDefaultValue = () => <Field name="email" label="Email" defaultValue="john@rambo.com" />;

export const WithTypePassword = () => <Field type="password" name="password" label="Password" />;
