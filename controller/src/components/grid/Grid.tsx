import * as React from "react";
import * as classNames from "classnames";
import "./Grid.scss";

/*
class StatusView extends React.Component {
  private logGridItemRef = React.createRef<HTMLDivElement>();

  public componentDidUpdate() {
    const node = this.logGridItemRef.current;

    console.log("componentDidUpdate", this.logGridItemRef, this.logGridItemRef.current);

    if (node) {
      console.log("up", node, node.scrollTop);

      node.scrollTop = node.scrollHeight - node.clientHeight;
    }
  }
*/

export type GridProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
export type GridItemProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  scrollToBottom?: boolean;
};

export const Grid: React.SFC<GridProps> = ({ children, className }) => (
  <div className={classNames("grid", className)}>{children}</div>
);

// export const GridItem: React.SFC<GridItemProps> = ({ children, className }) => (
//   <div className={classNames("grid__item", className)}>{children}</div>
// );

export class GridItem extends React.Component<GridItemProps> {
  private ref = React.createRef<HTMLDivElement>();

  public componentDidUpdate() {
    if (this.props.scrollToBottom !== true) {
      return;
    }

    const el = this.ref.current;

    if (!el) {
      return;
    }

    const isNearBottom = el.scrollHeight - el.clientHeight <= el.scrollTop + 50;

    // only force the scroll if near bottom
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight - el.clientHeight;
    }
  }

  public render() {
    return (
      <div ref={this.ref} className={classNames("grid__item", this.props.className)}>
        {this.props.children}
      </div>
    );
  }
}
