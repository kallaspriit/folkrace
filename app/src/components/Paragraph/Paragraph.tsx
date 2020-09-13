import React from "react";
import { FlexProps, Flex } from "../Flex/Flex";

export const P: React.FC<FlexProps> = ({ children, ...rest }) => (
  <Flex paragraph {...rest}>
    {children}
  </Flex>
);
