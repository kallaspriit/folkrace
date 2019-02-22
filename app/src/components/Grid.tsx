import styled, { css } from "styled-components";

import { Clickable, Theme } from "../theme";

export interface GridProps {
  columns?: string;
  rows?: string;
  wide?: boolean;
}

export interface CellProps {
  primary?: boolean;
  text?: boolean;
  status?: CellStatus;
}

export enum CellStatus {
  GOOD = "GOOD",
  WARN = "WARN",
  BAD = "BAD"
}

export const Grid = styled.div<GridProps>`
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

  ${props =>
    props.columns
      ? css`
          grid-template-columns: ${props.columns};
        `
      : ""}

  ${props =>
    props.rows
      ? css`
          grid-template-rows: ${props.rows};
        `
      : ""}
`;

const getGridItemStatusColorMap = (theme: Theme) => ({
  [CellStatus.GOOD]: theme.bg.good,
  [CellStatus.WARN]: theme.bg.warn,
  [CellStatus.BAD]: theme.bg.bad
});

export const Cell = styled.div<CellProps & Clickable>`
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
    props.status === CellStatus.BAD
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
