import classNames from "classnames";
import React from "react";
import { FlexProps } from "../Flex/Flex";
import { Row } from "../Row/Row";
import styles from "./TextButton.module.scss";

export interface TextButtonProps extends FlexProps {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
  withoutUnderline?: boolean;
}

export const TextButton: React.FC<TextButtonProps> = ({
  leading,
  trailing,
  secondary,
  children,
  className,
  withoutUnderline,
  ...rest
}) => (
  <Row
    secondary={secondary}
    darker={secondary !== true}
    alternate
    center
    className={classNames(
      styles["text-button"],
      {
        [styles["text-button--without-underline"]]: withoutUnderline,
      },
      className,
    )}
    {...rest}
  >
    {leading !== undefined && <div className={classNames(styles["icon"], styles["icon--leading"])}>{leading}</div>}
    {/* <div className={styles["children"]}>{children}</div> */}
    {children}
    {trailing !== undefined && <div className={classNames(styles["icon"], styles["icon--trailing"])}>{trailing}</div>}
  </Row>
);
