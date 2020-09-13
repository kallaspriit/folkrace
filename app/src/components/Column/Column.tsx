import React, { useRef } from "react";
import { useScrollToBottom } from "../../hooks/useScrollToBottom";
import { FlexProps, Flex, FlexElement, FlexRef } from "../Flex/Flex";

export interface ColumnProps extends FlexProps {
  autoscroll?: boolean;
}

export const Column: React.FC<ColumnProps> = ({ autoscroll, children, ...rest }) => {
  const ref = useRef<FlexElement>(null);

  useScrollToBottom(ref, autoscroll);

  if (autoscroll) {
    return (
      <FlexRef column scrollable ref={ref} {...rest}>
        {children}
      </FlexRef>
    );
  }

  return (
    <Flex column {...rest}>
      {children}
    </Flex>
  );
};
