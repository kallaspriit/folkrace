import { withKnobs, boolean } from "@storybook/addon-knobs";
import React from "react";
import { ReactComponent as AppleIcon } from "../../theme/icons/apple-icon.svg";
import { Container } from "../Container/Container";
import { P } from "./Paragraph";

export default {
  title: "Paragraph",
  component: P,
  decorators: [withKnobs],
};

export const Default = () => <P>Hello world</P>;

export const WithCenter = () => (
  <Container>
    <P center debug expanded>
      Hello world
    </P>
  </Container>
);

export const WithLarge = () => (
  <P debug large>
    Hello world
  </P>
);

export const WithExtraLarge = () => (
  <P debug extraLarge>
    Hello world
  </P>
);

export const WithStrong = () => (
  <P debug strong>
    Hello world
  </P>
);

export const WithThin = () => (
  <P debug thin>
    Hello world
  </P>
);

export const WithLight = () => (
  <P debug light>
    Hello world
  </P>
);

export const WithItalic = () => (
  <P debug italic>
    Hello world
  </P>
);

export const WithCompact = () => (
  <P debug compact>
    Hello world
  </P>
);

export const WithNowrap = () => (
  <Container style={{ width: "300px" }}>
    <P debug nowrap>
      Hello world with text too long to really render
    </P>
  </Container>
);

export const WithSecondary = () => <P secondary={boolean("Secondary", true)}>Hello world</P>;

export const WithAlternate = () => <P alternate={boolean("Alternate", true)}>Hello world</P>;

export const WithMultipleChildren = () => (
  <P secondary={boolean("Secondary", false)}>
    Hello
    <a href="https://apple.com" target="_blank" rel="noopener noreferrer">
      Apple
    </a>
    <AppleIcon style={{ height: "1em" }} />
  </P>
);
