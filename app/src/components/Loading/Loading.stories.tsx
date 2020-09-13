import React from "react";
import { Loading } from "./Loading";

export default {
  title: "Loading",
  component: Loading,
};

export const Default = () => <Loading />;

export const SizeSmall = () => <Loading small />;

export const SizeLarge = () => <Loading large />;
