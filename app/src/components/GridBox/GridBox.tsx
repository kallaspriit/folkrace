import React from "react";
import { Container } from "../Container/Container";
import { FlexProps } from "../Flex/Flex";

export interface GridBoxProps extends FlexProps {
  size: number;
}

export const GridBox: React.FC<GridBoxProps> = ({ size, style, ...rest }) => (
  <Container style={{ ...style, width: `${size}rem`, height: `${size}rem` }} {...rest} />
);
