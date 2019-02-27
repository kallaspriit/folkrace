import { lighten } from "polished";
import { MouseEventHandler } from "react";
import { createGlobalStyle, keyframes } from "styled-components";

// common visual configuration used by various components
export const theme = {
  text: {
    primary: "#f0f0f0",
    secondary: "#969696",
  },
  bg: {
    primary: "#cc3333",
    secondary: "#282828",
    tertiary: lighten(0.05, "#282828"),
    quaternary: "#087099",
    good: "#009900",
    warn: "#999900",
    bad: "#990000",
  },
  size: {
    darkerLighterPercentage: 0.25,
    gridGap: "2px",
    menuHeight: "64px",
  },
  animation: {
    fadeIn: keyframes`
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    `,
    pulse: (color: string) => keyframes`
      0% {
        background: ${color};
      }
      50% {
        background: ${lighten(0.25, color)};
      }
      100% {
        background: ${color};
      }
    `,
  },
};

// resolve theme type
export type Theme = typeof theme;

// clickable element
export interface Clickable<T = Element> {
  onClick?: MouseEventHandler<T>;
}

// these global styles get injected in the document above all else
export const GlobalStyle = createGlobalStyle`
  // main font
  @font-face {
    font-family: "heebo-regular";
    src: url("fonts/Heebo-Regular.ttf");
  }

  @font-face {
    font-family: "roboto-mono-light";
    src: url("fonts/RobotoMono-Light.ttf");
  }

  // default to using border box sizing
  html {
    box-sizing: border-box;
  }
  *,
  *:before,
  *:after {
    box-sizing: inherit;
  }

  // set body styles
  body,
  html {
    height: 100%;
    padding: 0;
    margin: 0;
    font-family: "heebo-regular";
    color: ${theme.text.primary};
    background-color: ${theme.bg.secondary};
  }
`;
