import classNames from "classnames";
import React from "react";
import { ReactComponent as BackIcon } from "../../theme/icons/back-icon.svg";
import { Container } from "../Container/Container";
import { FlexProps, FlexElement, FlexRef } from "../Flex/Flex";
import { GridBox } from "../GridBox/GridBox";
import { IconButton } from "../IconButton/IconButton";
import styles from "./TitleBar.module.scss";

export type OnBackCallback = () => void;

export interface TitleBarProps extends FlexProps {
  fixed?: boolean;
  transparent?: boolean;
  secondary?: boolean;
  title?: string;
  onBack?: OnBackCallback;
}

export const TitleBar = React.forwardRef<FlexElement, TitleBarProps>(
  ({ fixed, transparent, secondary, title, onBack, className, style, children, ...rest }, ref) => (
    <FlexRef
      row
      ref={ref}
      className={classNames(
        styles["title-bar"],
        {
          [styles["title-bar--fixed"]]: fixed,
          [styles["title-bar--transparent"]]: transparent,
          [styles["title-bar--secondary"]]: secondary,
          [styles["title-bar--border"]]: secondary,
        },
        className,
      )}
      style={{ ...style }}
      {...rest}
    >
      {onBack && (
        <IconButton
          secondary={!secondary}
          icon={<BackIcon />}
          onClick={onBack}
          className={classNames(styles["back-button"], { [styles["back-button--primary"]]: secondary })}
        />
      )}
      {title && (
        <Container expanded secondary={!secondary} large center>
          {title}
        </Container>
      )}

      {React.Children.map(children, (child, index) => {
        // adds a spacer between every child
        return (
          <>
            {index > 0 && <GridBox />}
            {child}
          </>
        );
      })}
    </FlexRef>
  ),
);

TitleBar.displayName = "TitleBar";
