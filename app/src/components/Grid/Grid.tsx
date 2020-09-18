import classNames from "classnames";
import React from "react";
import { FlexProps, Flex } from "../Flex/Flex";
import styles from "./Grid.module.scss";

export const Grid: React.FC<FlexProps> = ({ className, children, ...rest }) => (
  <Flex className={classNames(styles.grid, className)} {...rest}>
    {children}
  </Flex>
);
