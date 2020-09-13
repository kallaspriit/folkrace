import React from "react";
import { GridBox } from "./GridBox";

export default {
  title: "GridBox",
  component: GridBox,
};

export const Size1 = () => <GridBox debug size={1} />;

export const Size10 = () => <GridBox debug size={10} />;
