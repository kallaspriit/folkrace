import { action } from "@storybook/addon-actions";
import { withKnobs, boolean } from "@storybook/addon-knobs";
import React from "react";
import { ReactComponent as SettingsIcon } from "../../theme/icons/settings.svg";
import { BlockButton } from "./BlockButton";

export default {
  title: "BlockButton",
  component: BlockButton,
  decorators: [withKnobs],
};

export const Default = () => <BlockButton>Login</BlockButton>;

export const WithInline = () => <BlockButton inline={boolean("inline", true)}>Login</BlockButton>;

export const WithSecondary = () => <BlockButton secondary={boolean("Secondary", true)}>Login</BlockButton>;

export const WithTertiary = () => <BlockButton tertiary={boolean("Tertiary", true)}>Login</BlockButton>;

export const WithQuaternary = () => <BlockButton quaternary={boolean("Quaternary", true)}>Login</BlockButton>;

export const WithSecondaryAndLeading = () => (
  <BlockButton secondary={boolean("Secondary", true)} leading={<SettingsIcon />}>
    Login
  </BlockButton>
);

export const WithDisabled = () => (
  <BlockButton disabled={boolean("Disabled", true)} onClick={action("button clicked")}>
    Login
  </BlockButton>
);

export const WithLoading = () => (
  <BlockButton loading={boolean("Loading", true)} onClick={action("button clicked")}>
    Login
  </BlockButton>
);

export const WithLoadingAndLeading = () => (
  <BlockButton loading={boolean("Loading", true)} leading={<SettingsIcon />}>
    Login
  </BlockButton>
);

export const WithLeading = () => <BlockButton leading={<SettingsIcon />}>Login</BlockButton>;

export const WithLeadingInline = () => (
  <BlockButton inline leading={<SettingsIcon />}>
    Login
  </BlockButton>
);

export const WithTrailing = () => <BlockButton trailing={<SettingsIcon />}>Login</BlockButton>;

export const WithLeadingAndTrailing = () => (
  <BlockButton leading={<SettingsIcon />} trailing={<SettingsIcon />}>
    Login
  </BlockButton>
);

export const WithLeadingAndTrailingInline = () => (
  <BlockButton inline leading={<SettingsIcon />} trailing={<SettingsIcon />}>
    Login
  </BlockButton>
);

export const SizeSmall = () => (
  <BlockButton small leading={<SettingsIcon />}>
    Login
  </BlockButton>
);

export const SizeLarge = () => (
  <BlockButton large leading={<SettingsIcon />}>
    Login
  </BlockButton>
);
