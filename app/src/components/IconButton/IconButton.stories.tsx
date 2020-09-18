import React from "react";
import { ReactComponent as BackIcon } from "../../theme/icons/back-icon.svg";
import { IconButton } from "./IconButton";

export default {
  title: "IconButton",
  component: IconButton,
};

export const Default = () => <IconButton icon={<BackIcon />} />;

export const WithTitle = () => <IconButton icon={<BackIcon />}>Gift</IconButton>;

export const WithSecondary = () => (
  <IconButton secondary icon={<BackIcon style={{ fill: "#ffffff" }} />}>
    Back
  </IconButton>
);

export const WithLongTitle = () => <IconButton icon={<BackIcon />}>Click here to go back</IconButton>;

export const WithLarge = () => (
  <IconButton large icon={<BackIcon />}>
    Back
  </IconButton>
);

export const WithExtraLarge = () => (
  <IconButton extraLarge icon={<BackIcon />}>
    Back
  </IconButton>
);

export const WithBadge = () => (
  <IconButton padded badge="8" icon={<BackIcon />}>
    Back
  </IconButton>
);
