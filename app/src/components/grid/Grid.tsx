import classNames from "classnames";
import * as React from "react";

import "./Grid.scss";

export type GridProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;
export type GridItemProps = React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLDivElement>,
  HTMLDivElement
>;

export const Grid: React.SFC<GridProps> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={classNames("grid", className)}>
    {children}
  </div>
);

export const GridItem: React.SFC<GridItemProps> = ({
  children,
  className,
  ...props
}) => (
  <div {...props} className={classNames("grid__item", className)}>
    {children}
  </div>
);
