import classNames from "classnames";
import React, { useCallback } from "react";
import { Column } from "../Column/Column";
import { Container } from "../Container/Container";
import { FlexProps } from "../Flex/Flex";
import { Row } from "../Row/Row";
import { Stack } from "../Stack/Stack";
import styles from "./MainMenu.module.scss";

export type OnTopMenuItemClickCallback = (index: number) => void;

export interface MainMenuProps extends FlexProps {
  activeItemIndex: number;
  onItemClick: OnTopMenuItemClickCallback;
}

export const MainMenu: React.FC<MainMenuProps> = ({ activeItemIndex, onItemClick, children, ...rest }) => {
  // called on menu items click
  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // dataset only exists on html elements, throw error if we get something else
      if (!(e.currentTarget instanceof HTMLElement)) {
        throw new Error("Expected main menu item to be html element but got something else, this should not happen");
      }

      // get index data attribute
      const indexString = e.currentTarget.dataset.index;

      // the "data-index" attribute should always be defined
      if (indexString === undefined) {
        throw new Error(
          "Expected clicked main menu item to contain menu index as data attribute but found none, this should not happen",
        );
      }

      // get clicked menu index from data attribute
      const index = parseInt(indexString, 10);

      onItemClick(index);
    },
    [onItemClick],
  );

  return (
    <Stack ignorePointerEvents className={styles.stack} {...rest}>
      <div className={styles["background-behind"]} />
      <Row mainAxisAlignment="space-evenly">
        {React.Children.map(children, (child, index) => {
          // clone top menu items with isActive=true if item index matches activeItemIndex
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              "data-index": index,
              active: activeItemIndex === index,
              background: true,
              onClick: handleItemClick,
            });
          }

          return child;
        })}
      </Row>
      <div className={styles["background-front"]} />
      <Row mainAxisAlignment="space-evenly">
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              "data-index": index,
              active: activeItemIndex === index,
              background: false,
              onClick: handleItemClick,
            });
          }

          return child;
        })}
      </Row>
    </Stack>
  );
};

export interface MainMenuItemProps extends FlexProps {
  icon?: React.ReactNode;
  active?: boolean;
  background?: boolean;
}

export const MainMenuItem: React.FC<MainMenuItemProps> = React.memo(function MainMenuItem({
  icon,
  active,
  background,
  className,
  children,
  ...rest
}) {
  return (
    <Column
      className={classNames(
        styles["main-menu-item"],
        {
          [styles["main-menu-item--active"]]: active,
          [styles["main-menu-item--background"]]: background,
        },
        className,
      )}
      {...rest}
    >
      <Container center expanded className={styles["main-menu-icon"]}>
        {icon}
      </Container>
      <Container className={styles["main-menu-text"]}>{children}</Container>
    </Column>
  );
});
