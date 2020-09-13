import classNames from "classnames";
import React from "react";
import { Container } from "../Container/Container";
import { Loading } from "../Loading/Loading";
import { Row as button, Row } from "../Row/Row";
import styles from "./BlockButton.module.scss";

export type BlockButtonSize = "small" | "medium" | "large";

export interface BlockButtonProps extends React.ComponentPropsWithoutRef<"button"> {
  inline?: boolean;
  secondary?: boolean;
  tertiary?: boolean;
  quaternary?: boolean;
  small?: boolean;
  large?: boolean;
  disabled?: boolean;
  loading?: boolean;
  debug?: boolean;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  className?: string;
}

export const BlockButton: React.FC<BlockButtonProps> = ({
  inline,
  secondary,
  tertiary,
  quaternary,
  small,
  large,
  disabled,
  loading,
  leading,
  debug,
  trailing,
  className,
  children,
  onClick,
  ...rest
}) => (
  <button
    type="button"
    className={classNames(styles["block-button"], {
      [styles["block-button--inline"]]: inline,
    })}
    onClick={(e) => {
      // don't pass on the click event if disabled or loading
      if (!onClick || disabled || loading) {
        return;
      }

      onClick(e);
    }}
    {...rest}
  >
    <Row
      center
      inline={inline}
      debug={debug}
      className={classNames(
        styles["wrap"],
        {
          [styles["wrap--inline"]]: inline,
          [styles["wrap--secondary"]]: secondary,
          [styles["wrap--tertiary"]]: tertiary,
          [styles["wrap--quaternary"]]: quaternary,
          [styles["wrap--disabled"]]: disabled || loading,
          [styles["wrap--loading"]]: loading,
          [styles["wrap--with-leading"]]: leading !== undefined,
          [styles["wrap--with-trailing"]]: trailing !== undefined,
          [styles["wrap--size-small"]]: small,
          [styles["wrap--size-large"]]: large,
        },
        className,
      )}
    >
      {leading !== undefined && <div className={classNames(styles["icon"], styles["icon--leading"])}>{leading}</div>}
      <Container expanded center className={styles.content}>
        <Container className={styles.children}>{children}</Container>
        <Container center className={styles["loading-wrap"]}>
          <Loading small={small} large={large} />
        </Container>
      </Container>
      {trailing !== undefined && <div className={classNames(styles["icon"], styles["icon--trailing"])}>{trailing}</div>}
    </Row>
  </button>
);
