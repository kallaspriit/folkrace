import styled, { css } from "styled-components";

import { DivProps, Theme } from "../theme";

export enum GridItemStatus {
  GOOD = "GOOD",
  WARN = "WARN",
  BAD = "BAD"
}

export interface GridItemProps {
  primary?: boolean;
  text?: boolean;
  status?: GridItemStatus;
}

export const Grid = styled.div`
  display: grid;
  grid-gap: ${props => props.theme.size.gridGap};
  margin: ${props => props.theme.size.gridGap};
  height: calc(
    100vh -
      (
        ${props => props.theme.size.menuHeight} +
          (${props => props.theme.size.gridGap} * 2)
      )
  );
`;

const getGridItemStatusColorMap = (theme: Theme) => ({
  [GridItemStatus.GOOD]: theme.bg.good,
  [GridItemStatus.WARN]: theme.bg.warn,
  [GridItemStatus.BAD]: theme.bg.bad
});

export const GridItem = styled.div<GridItemProps & DivProps>`
  position: relative;
  background-color: ${props => props.theme.bg.tertiary};
  font-variant: ${props => (props.primary ? "all-small-caps" : "normal")};

  ${props =>
    props.text
      ? css`
          line-height: 1.25em;
          text-align: center;
          margin-top: 8px;
        `
      : ""}

  ${props =>
    props.status
      ? css`
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px;
          overflow: hidden;
          background-color: ${getGridItemStatusColorMap(props.theme)[
            props.status
          ]};
        `
      : ""}

  ${props =>
    props.status === GridItemStatus.BAD
      ? css`
          animation: ${props.theme.animation.pulse(
              getGridItemStatusColorMap(props.theme)[props.status]
            )}
            3s ease;
          animation-iteration-count: infinite;
          animation-delay: 1s;
        `
      : ""}
`;
