import { action } from "@storybook/addon-actions";
import React from "react";
import { ReactComponent as SettingsIcon } from "../../theme/icons/settings-icon.svg";
import { TextButton } from "./TextButton";

export default {
  title: "TextButton",
  component: TextButton,
};

export const Default = () => <TextButton>Hello</TextButton>;

export const WithInline = () => <TextButton inline>Hello</TextButton>;

export const WithCallback = () => <TextButton onClick={action("button clicked")}>On click</TextButton>;

export const WithLeading = () => <TextButton leading={<SettingsIcon />}>Hello</TextButton>;

export const WithLeadingInline = () => (
  <TextButton inline leading={<SettingsIcon />}>
    Hello
  </TextButton>
);

export const WithTrailing = () => <TextButton trailing={<SettingsIcon />}>Hello</TextButton>;

export const WithLeadingAndTrailing = () => (
  <TextButton leading={<SettingsIcon />} trailing={<SettingsIcon />}>
    Hello
  </TextButton>
);

export const WithSecondary = () => <TextButton secondary>Hello</TextButton>;

export const WithoutUnderline = () => (
  <TextButton withoutUnderline secondary>
    Hello
  </TextButton>
);
