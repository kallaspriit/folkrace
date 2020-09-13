import classNames from "classnames";
import React from "react";
import { FlexProps, FlexRef, FlexElement } from "../Flex/Flex";
import styles from "./Stack.module.scss";

export interface StackProps extends FlexProps {
  referenceFirstChild?: boolean;
}

export const Stack = React.forwardRef<FlexElement, StackProps>(
  ({ referenceFirstChild, className, children, ...rest }, ref) => (
    <FlexRef
      ref={ref}
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
    </FlexRef>
  ),
);

Stack.displayName = "Stack";
