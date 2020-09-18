import { action } from "@storybook/addon-actions";
import React from "react";
import { ReactComponent as SettingsIcon } from "../../theme/icons/settings-icon.svg";
import { ButtonGroup, ButtonGroupButton } from "./ButtonGroup";

export default {
  title: "ButtonGroup",
  component: ButtonGroup,
};

export const Default = () => (
  <ButtonGroup>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton>Second</ButtonGroupButton>
  </ButtonGroup>
);

export const WithInline = () => (
  <ButtonGroup inline>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton>Second</ButtonGroupButton>
  </ButtonGroup>
);

export const WithSecondary = () => (
  <ButtonGroup>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton secondary>Second</ButtonGroupButton>
  </ButtonGroup>
);

export const WithTertiary = () => (
  <ButtonGroup>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton tertiary>Second</ButtonGroupButton>
  </ButtonGroup>
);

export const WithSmall = () => (
  <ButtonGroup small>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton tertiary>Second</ButtonGroupButton>
  </ButtonGroup>
);

export const WithEqualWidth = () => (
  <ButtonGroup small equalWidth>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton tertiary>Second and ai am very long </ButtonGroupButton>
  </ButtonGroup>
);

export const WithRoundedCorners = () => (
  <ButtonGroup small equalWidth rounded>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton secondary>Second and ai am very long </ButtonGroupButton>
  </ButtonGroup>
);

export const WithLeadingIcon = () => (
  <ButtonGroup small equalWidth rounded>
    <ButtonGroupButton leading={<SettingsIcon />}>First</ButtonGroupButton>
    <ButtonGroupButton secondary>Second and ai am very long </ButtonGroupButton>
  </ButtonGroup>
);

export const WithTransparent = () => (
  <ButtonGroup>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton transparent>Second</ButtonGroupButton>
  </ButtonGroup>
);

export const WithSingleButton = () => (
  <ButtonGroup>
    <ButtonGroupButton>First</ButtonGroupButton>
  </ButtonGroup>
);

export const WithQuaternary = () => (
  <ButtonGroup>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton quaternary>Second</ButtonGroupButton>
  </ButtonGroup>
);

export const WithMoreThanTwoChildren = () => (
  <ButtonGroup>
    <ButtonGroupButton>First</ButtonGroupButton>
    <ButtonGroupButton>Second</ButtonGroupButton>
    <ButtonGroupButton>Third and fourth and stuff</ButtonGroupButton>
    <ButtonGroupButton>Fourth</ButtonGroupButton>
  </ButtonGroup>
);

export const WithCallback = () => (
  <ButtonGroup>
    <ButtonGroupButton onClick={action("clicked first")}>First</ButtonGroupButton>
    <ButtonGroupButton onClick={action("clicked second")}>Second</ButtonGroupButton>
  </ButtonGroup>
);
