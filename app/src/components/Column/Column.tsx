import React, { useRef } from "react";
import { useScrollToBottom } from "../../hooks/useScrollToBottom";
import { FlexProps, Flex, FlexElement } from "../Flex/Flex";

export interface ColumnProps extends FlexProps {
  autoscroll?: boolean;
}

export const Column: React.FC<ColumnProps> = ({ autoscroll, children, ...rest }) => {
  const ref = useRef<FlexElement>(null);

  useScrollToBottom(ref, autoscroll);

  if (autoscroll) {
    return (
      <Flex column scrollable ref={ref} {...rest}>
        {children}
      </Flex>
    );
  }

  return (
    <Flex column {...rest}>
      {children}
    </Flex>
  );
};
