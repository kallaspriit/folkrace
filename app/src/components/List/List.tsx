import classNames from "classnames";
import React from "react";
import { ReactComponent as ForwardArrowIcon } from "../../theme/icons/forward-arrow.svg";
import { Column } from "../Column/Column";
import { Container } from "../Container/Container";
import { FlexProps } from "../Flex/Flex";
import { GridBox } from "../GridBox/GridBox";
import { P } from "../Paragraph/Paragraph";
import { Row } from "../Row/Row";
import styles from "./List.module.scss";

// TODO: use cloneElement instead, so we do not need to manually add props to children
export const List: React.FC<FlexProps> = ({ children, ...rest }) => <Column {...rest}>{children}</Column>;

export interface ListItemProps extends FlexProps {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  removeTrailing?: boolean;
  leadingIconAutoSize?: boolean;
  noBorder?: boolean;
  compact?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  leading,
  trailing,
  removeTrailing,
  leadingIconAutoSize,
  noBorder,
  compact,
  children,
  className,
  ...rest
}) => (
  <Row
    crossAxisAlignment="center"
    className={classNames(
      styles["list-item"],
      { [styles["list-item--no-border"]]: noBorder, [styles["list-item--compact"]]: compact },
      className,
    )}
    {...rest}
  >
    {leading && (
      <Container
        className={classNames(styles["leading-icon"], {
          [styles["leading-icon--auto-size"]]: leadingIconAutoSize,
        })}
      >
        {leading}
      </Container>
    )}
    <Container>{children}</Container>
    <Container className={styles["trailing-icon"]}>
      {trailing === undefined ? !removeTrailing && <ForwardArrowIcon /> : trailing}
    </Container>
  </Row>
);

export const ListTitle: React.FC<FlexProps> = ({ children, ...rest }) => (
  <>
    <GridBox size={6} />
    <Column paddedHorizontal {...rest}>
      <P large darker>
        {children}
      </P>
    </Column>
    <GridBox size={3} />
  </>
);
