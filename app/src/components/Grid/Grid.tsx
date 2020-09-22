import classNames from "classnames";
import React, { CSSProperties } from "react";
import { FlexProps, Flex } from "../Flex/Flex";
import styles from "./Grid.module.scss";

export interface GridProps extends FlexProps {
  rowsTemplate?: string;
  columnsTemplate?: string;
}

export const Grid: React.FC<GridProps> = ({ rowsTemplate, columnsTemplate, className, style, children, ...rest }) => {
  const augmentedStyle: CSSProperties = {
    ...style,
  };

  if (rowsTemplate) {
    augmentedStyle.gridTemplateRows = rowsTemplate;
  }

  if (columnsTemplate) {
    augmentedStyle.gridTemplateColumns = columnsTemplate;
  }

  return (
    <Flex className={classNames(styles.grid, className)} style={augmentedStyle} {...rest}>
      {children}
    </Flex>
  );
};
