import classNames from "classnames";
import * as React from "react";

import "./Grid.scss";

export type GridProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
export type GridItemProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  scrollToBottom?: boolean;
};

export const Grid: React.SFC<GridProps> = ({ children, className }) => (
  <div className={classNames("grid", className)}>{children}</div>
);

// TODO: scroll to bottom on first render
export class GridItem extends React.Component<GridItemProps> {
  private readonly ref = React.createRef<HTMLDivElement>();

  componentDidUpdate() {
    // return if scrolling to bottom is not requested
    if (this.props.scrollToBottom !== true) {
      return;
    }

    // get the dom node from the reference
    const el = this.ref.current;

    // return if element could not be found
    if (!el) {
      console.warn("grid item dom node not found");

      return;
    }

    // check whether we're aready near the bottom
    const isNearBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 50;

    // only force the scroll if near bottom
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }
  }

  render() {
    return (
      <div ref={this.ref} className={classNames("grid__item", this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}
