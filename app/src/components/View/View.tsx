import React from "react";
import { Column } from "../Column/Column";
import { FlexProps } from "../Flex/Flex";

export const View: React.FC<FlexProps> = ({ children, ...rest }) => (
  <Column cover {...rest}>
    {children}
  </Column>
);
