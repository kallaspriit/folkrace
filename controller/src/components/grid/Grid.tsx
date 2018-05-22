import * as React from "react";
import * as classNames from "classnames";
import "./Grid.scss";

export type GridProps = React.HTMLAttributes<{}>;
export type GridItemProps = React.HTMLAttributes<{}>;

export const Grid: React.SFC<GridProps> = ({ children, className }) => (
  <div className={classNames("grid", className)}>{children}</div>
);

export const GridItem: React.SFC<GridItemProps> = ({ children, className }) => (
  <div className={classNames("grid__item", className)}>{children}</div>
);
