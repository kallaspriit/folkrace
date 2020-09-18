import React from "react";
import { Flex, FlexOptions } from "../Flex/Flex";

export type FormProps = FlexOptions & React.ComponentPropsWithoutRef<"form">;

export const Form: React.FC<FormProps> = ({ children, ...rest }) => (
  <Flex form {...(rest as any)}>
    {children}
  </Flex>
);
