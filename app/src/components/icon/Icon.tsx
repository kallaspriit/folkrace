import * as classNames from "classnames";
import * as React from "react";

export type IconProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  name: string;
  width?: string | number;
  height?: string | number;
};

const Icon: React.SFC<IconProps> = ({ children, name, width, height, className }) => (
  <i className={classNames("icon", `icon__${name}`, className)} style={getStyle(width, height)}>
    {children}
  </i>
);

function getStyle(width: string | number | undefined, height: string | number | undefined): React.CSSProperties {
  const style: React.CSSProperties = {};

  if (typeof width === "string") {
    style.width = `${width}${parseFloat(width).toString() === width ? "px" : ""}`;
  } else if (typeof width === "number") {
    style.width = `${width}px`;
  }

  if (typeof height === "string") {
    style.height = `${height}${parseFloat(height).toString() === height ? "px" : ""}`;
  } else if (typeof height === "number") {
    style.height = `${height}px`;
  }

  return style;
}

export default Icon;
