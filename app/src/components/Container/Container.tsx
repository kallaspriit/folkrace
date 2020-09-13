import React from "react";
import { FlexProps, Flex } from "../Flex/Flex";

export const Container: React.FC<FlexProps> = ({ children, ...rest }) => (
  <Flex column {...rest}>
    {children}
  </Flex>
);
