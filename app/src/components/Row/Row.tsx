import React from "react";
import { FlexProps, Flex } from "../Flex/Flex";

export const Row: React.FC<FlexProps> = ({ children, ...rest }) => (
  <Flex row {...rest}>
    {children}
  </Flex>
);
