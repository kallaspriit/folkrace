import classNames from "classnames";
import React from "react";
import { Column } from "../Column/Column";
import { Container } from "../Container/Container";
import { FlexProps } from "../Flex/Flex";
import { P } from "../Paragraph/Paragraph";
import styles from "./IconButton.module.scss";

export interface IconButtonProps extends FlexProps {
  large?: boolean;
  extraLarge?: boolean;
  badge?: string;
  icon: React.ReactNode;
}

export const IconButton: React.FC<IconButtonProps> = ({
  large,
  extraLarge,
  badge,
  icon,
  secondary,
  className,
  children,
  ...rest
}) => (
  <Column overflow inline center className={classNames(styles["icon-button"], className)} {...rest}>
    <Column
      overflow
      className={classNames(styles.icon, {
        [styles["icon--secondary"]]: secondary,
        [styles["icon--large"]]: large,
        [styles["icon--extra-large"]]: extraLarge,
      })}
    >
      {icon}
      {badge && (
        <Container center className={styles.badge}>
          {badge}
        </Container>
      )}
    </Column>
    {React.Children.count(children) > 0 && (
      <P
        secondary={secondary}
        className={classNames(styles["icon-text"], {
          [styles["icon-text--large"]]: large,
          [styles["icon-text--extra-large"]]: extraLarge,
        })}
      >
        {children}
      </P>
    )}
  </Column>
);
