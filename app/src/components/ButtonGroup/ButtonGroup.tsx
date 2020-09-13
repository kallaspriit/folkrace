import classNames from "classnames";
import React from "react";
import { Container } from "../Container/Container";
import { FlexProps } from "../Flex/Flex";
import { Row } from "../Row/Row";
import styles from "./ButtonGroup.module.scss";

interface ButtonGroupProps extends FlexProps {
  small?: boolean;
  equalWidth?: boolean;
  rounded?: boolean;
}

export const ButtonGroup: React.FC<ButtonGroupProps> = ({
  small,
  equalWidth,
  rounded,
  children,
  className,
  ...rest
}) => (
  <Row
    className={classNames(
      styles["button-group"],
      {
        [styles["button-group--small"]]: small,
        [styles["button-group--equal-width"]]: equalWidth,
        [styles["button-group--rounded"]]: rounded,
      },
      className,
    )}
    {...rest}
  >
    {children}
  </Row>
);

interface ButtonGroupButtonProps extends FlexProps {
  transparent?: boolean;
  secondary?: boolean;
  tertiary?: boolean;
  quaternary?: boolean;
  leading?: React.ReactNode;
}

export const ButtonGroupButton: React.FC<ButtonGroupButtonProps> = ({
  transparent,
  secondary,
  tertiary,
  quaternary,
  leading,
  className,
  children,
  ...rest
}) => (
  <Row
    center
    className={classNames(
      styles["button-group-button"],
      {
        [styles["button-group-button--transparent"]]: transparent,
        [styles["button-group-button--secondary"]]: secondary,
        [styles["button-group-button--tertiary"]]: tertiary,
        [styles["button-group-button--quaternary"]]: quaternary,
      },
      className,
    )}
    {...rest}
  >
    {leading && <div className={styles["leading-icon"]}>{leading}</div>}
    <Container expanded center>
      {children}
    </Container>
  </Row>
);
