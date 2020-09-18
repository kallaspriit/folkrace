import classNames from "classnames";
import React, { useState } from "react";
import { UseFormMethods, FieldError } from "react-hook-form";
import { ReactComponent as PasswordHideIcon } from "../../theme/icons/password-hide-icon.svg";
import { ReactComponent as PasswordShowIcon } from "../../theme/icons/password-show-icon.svg";
import { Container } from "../Container/Container";
import { FlexElement, FlexRef } from "../Flex/Flex";
import { Row } from "../Row/Row";
import { Stack } from "../Stack/Stack";
import styles from "./Field.module.scss";

export interface FieldProps extends React.ComponentPropsWithoutRef<"input"> {
  requiresActivation?: boolean;
  name: string;
  label: string;
  defaultValue?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  error?: FieldError;
  register?: UseFormMethods["register"] | React.Ref<HTMLInputElement>;
  expandTrailing?: boolean;
  withoutBorder?: boolean;
}

export const Field = React.forwardRef<FlexElement, FieldProps>(
  (
    {
      requiresActivation,
      type,
      name,
      label,
      defaultValue,
      leading,
      trailing,
      error,
      register,
      expandTrailing, // used only by EditableField
      withoutBorder,
      className,
      onClick,
      onChange,
      onFocus,
      onBlur,
      ...rest
    },
    ref,
  ) => {
    const [hasValue, setHasValue] = useState(typeof defaultValue === "string" && defaultValue.length > 0);
    const [hasFocus, setHasFocus] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isActivated, setIsActivated] = useState(requiresActivation === true ? false : true);

    const handleValueChange = (value: string) => {
      const hasValueNow = value.length > 0;

      // only update state if having value has changed
      if (hasValueNow !== hasValue) {
        setHasValue(hasValueNow);
      }
    };

    // toggle password button (both show and hide icons are shown on top of each other and faded in/out)
    const togglePassword = (
      <Stack>
        <Container center>
          <PasswordHideIcon
            className={classNames(styles["toggle-password"], { [styles["toggle-password--visible"]]: showPassword })}
          />
        </Container>
        <Container center>
          <PasswordShowIcon
            className={classNames(styles["toggle-password"], { [styles["toggle-password--visible"]]: !showPassword })}
          />
        </Container>
      </Stack>
    );

    // use password toggle for password fields when custom trailing element has not been set
    const usePasswordToggle = trailing === undefined && type === "password";
    const useTrailing = usePasswordToggle ? togglePassword : trailing;

    // called when trailing icon container is clicked (larger click area)
    const onTrailingClick = () => {
      if (usePasswordToggle) {
        setShowPassword(!showPassword);
      }
    };

    const constraintsIdentifier = `${name}-constraints`;

    return (
      <FlexRef
        column
        className={classNames(
          styles.field,
          {
            [styles["field--has-value"]]: hasValue,
            [styles["field--has-focus"]]: hasFocus,
            [styles["field--has-error"]]: error !== undefined,
            [styles["field--has-leading"]]: leading !== undefined,
            [styles["field--deactivated"]]: !isActivated,
          },
          className,
        )}
        ref={ref}
      >
        <label htmlFor={name} className={styles.label}>
          {label}
        </label>
        <Row>
          {leading !== undefined && (
            <Container className={classNames(styles["icon"], styles["icon--leading"])}>{leading}</Container>
          )}
          <Container expanded>
            <input
              ref={register}
              id={name}
              type={showPassword ? "text" : type}
              name={name}
              defaultValue={defaultValue}
              aria-describedby={constraintsIdentifier}
              onClick={(e) => {
                setIsActivated(true);

                if (onClick) {
                  onClick(e);
                }
              }}
              onChange={(e) => {
                handleValueChange(e.target.value);

                if (onChange) {
                  onChange(e);
                }
              }}
              onFocus={(e) => {
                setHasFocus(true);

                if (onFocus) {
                  onFocus(e);
                }
              }}
              onBlur={(e) => {
                setHasFocus(false);

                if (onBlur) {
                  onBlur(e);
                }
              }}
              className={styles.input}
              {...rest}
            />
          </Container>
          {useTrailing !== undefined && (
            <Row
              className={classNames(styles["icon"], styles["icon--trailing"], {
                [styles["icon--expand-trailing"]]: expandTrailing,
              })}
              onClick={onTrailingClick}
              aria-label={
                usePasswordToggle ? (showPassword ? "Hide password" : "Show password as plain text") : undefined
              }
            >
              {useTrailing}
            </Row>
          )}
        </Row>
        <div
          className={classNames(styles.border, {
            [styles["border--transparent"]]: withoutBorder,
          })}
        ></div>
        <div id={constraintsIdentifier} className={styles.error}>
          {error && error.message}
        </div>
      </FlexRef>
    );
  },
);

Field.displayName = "Field";
