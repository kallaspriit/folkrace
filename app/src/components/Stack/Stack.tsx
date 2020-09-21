import classNames from "classnames";
import React from "react";
import { FlexProps, Flex, FlexElement } from "../Flex/Flex";
import styles from "./Stack.module.scss";

export interface StackProps extends FlexProps {
  referenceFirstChild?: boolean;
}

export const Stack = React.forwardRef<FlexElement, StackProps>(function Stack(
  { referenceFirstChild, className, children, ...rest },
  ref,
) {
  return (
    <Flex
      flexRef={ref}
      className={classNames(
        styles.stack,
        {
          [styles["stack--reference-first-child"]]: referenceFirstChild,
          [styles["stack--no-reference"]]: !referenceFirstChild,
        },
        className,
      )}
      {...rest}
    >
      {children}
    </Flex>
  );
});
