import React from "react";
import { FlexProps, Flex } from "../Flex/Flex";

export const Span: React.FC<FlexProps> = ({ children, ...rest }) => (
  <Flex span {...rest}>
    {children}
  </Flex>
);
