import classNames from "classnames";
import React, { useRef } from "react";
import { useDisableScrolling } from "../../hooks/useDisableScrolling";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import { Column } from "../Column/Column";
import { FlexProps, Flex } from "../Flex/Flex";
import { P } from "../Paragraph/Paragraph";
import { Row } from "../Row/Row";
import styles from "./Modal.module.scss";

// TODO: use some animations, to make it a little bit smoother

export interface ModalProps extends FlexProps {
  open?: boolean;
  fullscreen?: boolean;
  backdrop?: boolean;
  onClickOutside?: VoidFunction;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  fullscreen,
  backdrop,
  onClickOutside,
  className,
  children,
  ...rest
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // only disable scrolling if the modal is open
  useDisableScrolling(open);

  useOnClickOutside(modalRef, () => {
    if (!onClickOutside) {
      return;
    }

    onClickOutside();
  });

  return (
    <Column
      column
      center
      expanded
      className={classNames(
        styles.modal,
        {
          [styles["modal--open"]]: open,
          [styles["modal--backdrop"]]: backdrop,
        },
        className,
      )}
      {...rest}
    >
      <Flex
        column
        ref={modalRef}
        className={classNames(styles["body"], {
          [styles["body--fullscreen"]]: fullscreen,
        })}
      >
        {children}
      </Flex>
    </Column>
  );
};

export interface ModalBodyProps extends FlexProps {
  withoutPadding?: boolean;
  title?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ withoutPadding, title, className, children, ...rest }) => (
  <Column
    shrinkable
    className={classNames(
      styles.content,
      {
        [styles["content--without-padding"]]: withoutPadding,
      },
      className,
    )}
    {...rest}
  >
    {title !== undefined && (
      <P center extraLarge className={styles.title}>
        {title}
      </P>
    )}
    {children}
  </Column>
);

export const ModalActions: React.FC<FlexProps> = ({ className, children, ...rest }) => (
  <Row className={classNames(styles["modal-actions"], className)} {...rest}>
    {React.Children.map(children, (child, index) => {
      // add a divider between every child
      return (
        <>
          {index > 0 && <div className={styles["divider"]} />}
          {child}
        </>
      );
    })}
  </Row>
);

export interface ModalButtonProps extends FlexProps {
  highlighted?: boolean;
}

export const ModalButton: React.FC<ModalButtonProps> = ({ highlighted, className, children, ...rest }) => (
  <Column
    center
    expanded
    className={classNames(styles["modal-button"], { [styles["modal-button--highlighted"]]: highlighted }, className)}
    {...rest}
  >
    {children}
  </Column>
);
