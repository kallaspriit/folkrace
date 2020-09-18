import React from "react";
import { Container } from "../Container/Container";
import { FlexProps } from "../Flex/Flex";

export interface GridBoxProps extends FlexProps {
  size?: number;
  half?: boolean;
}

export const GridBox: React.FC<GridBoxProps> = ({ size, half, style, ...rest }) => {
  // full size should match $layout-view-padding in _variables.scss
  const fullSize = 6;
  const useSize = size ? size : half ? fullSize / 2 : fullSize;

  return <Container style={{ ...style, width: `${useSize}rem`, height: `${useSize}rem` }} {...rest} />;
};
