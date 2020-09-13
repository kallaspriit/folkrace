import React from "react";
import { FlexProps, Flex } from "../Flex/Flex";

export const Column: React.FC<FlexProps> = ({ children, ...rest }) => (
  <Flex column {...rest}>
    {children}
  </Flex>
);
