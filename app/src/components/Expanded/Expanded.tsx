import React from "react";
import { FlexProps, Flex } from "../Flex/Flex";

export const Expanded: React.FC<FlexProps> = ({ children, ...rest }) => (
  <Flex expanded {...rest}>
    {children}
  </Flex>
);
