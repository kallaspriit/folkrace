import React from "react";
import { Loading } from "../Loading/Loading";
import { NameValuePair } from "./NameValuePair";

export default {
  title: "NameValuePair",
  component: NameValuePair,
};

export const Default = () => <NameValuePair name="Name">Value</NameValuePair>;

export const WithVertical = () => (
  <NameValuePair vertical name="Name">
    Value
  </NameValuePair>
);

export const WithCustomChildren = () => (
  <NameValuePair name="Name">
    <Loading small />
  </NameValuePair>
);
