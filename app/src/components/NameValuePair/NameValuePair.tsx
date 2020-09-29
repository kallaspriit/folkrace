import classNames from "classnames";
import React from "react";
import { Column } from "../Column/Column";
import { FlexProps } from "../Flex/Flex";
import { P } from "../Paragraph/Paragraph";
import { Row } from "../Row/Row";
import styles from "./NameValuePair.module.scss";

export interface NameValuePairProps extends FlexProps {
  name: React.ReactNode;
  vertical?: boolean;
}

export const NameValuePair: React.FC<NameValuePairProps> = ({ name, vertical, className, children, ...rest }) => {
  if (vertical) {
    return (
      <Column className={classNames(styles["name-value-pair"], className)} {...rest}>
        <P>{name}</P>
        {typeof children === "string" ? (
          <P small secondary>
            {children}
          </P>
        ) : (
          children
        )}
      </Column>
    );
  }

  return (
    <Row
      mainAxisAlignment="space-between"
      crossAxisAlignment="center"
      className={classNames(styles["name-value-pair"], className)}
      {...rest}
    >
      {typeof name === "string" ? <P>{name}</P> : name}
      {typeof children === "string" ? <P secondary>{children}</P> : children}
    </Row>
  );
};
