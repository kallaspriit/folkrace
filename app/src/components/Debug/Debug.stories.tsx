import React from "react";
import { Debug } from "./Debug";

export default {
  title: "Debug",
  component: Debug,
};

export const Default = () => <Debug />;

export const WithTitle = () => <Debug title="Local storage">{window.localStorage}</Debug>;

export const WithStringChild = () => <Debug title="With string">Hello World</Debug>;

export const WithArrayChild = () => <Debug title="With array">{["First", "Second", 42]}</Debug>;

export const WithObjectChild = () => <Debug title="With object">{{ name: "Jack Daniels", age: 42 }}</Debug>;
