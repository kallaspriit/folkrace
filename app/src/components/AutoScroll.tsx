import React from "react";

export type Props = React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
  scrollToBottom?: boolean;
};

export class AutoScroll extends React.Component<Props> {
  private readonly ref = React.createRef<HTMLDivElement>();

  componentDidUpdate() {
    // return if scrolling to bottom is not requested, default to true
    if (this.props.scrollToBottom === false) {
      return;
    }

    // get the dom node from the reference
    const el = this.ref.current;

    // return if element could not be found
    if (!el) {
      console.warn("auto-scroll dom node not found");

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
    // filter out unsupported props
    const { scrollToBottom, ...props } = this.props;

    return (
      <div {...props} ref={this.ref}>
        {this.props.children}
      </div>
    );
  }
}
