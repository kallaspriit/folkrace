import classNames from "classnames";
import React from "react";
import styles from "./Flex.module.scss";

export type FlexAlignment =
  | "flex-start"
  | "flex-end"
  | "center"
  | "baseline"
  | "stretch"
  | "space-between"
  | "space-evenly";

export type TextAlignment = "left" | "center" | "right" | "justify";

// this is only true for default <Flex/> element that uses <div /> as base element
export type FlexElement = HTMLDivElement;

export type FlexTag = keyof React.ReactHTML;

export interface FlexOptions {
  secondary?: boolean;
  alternate?: boolean;
  column?: boolean;
  row?: boolean;
  inline?: boolean;
  nowrap?: boolean;
  overflow?: boolean;
  expanded?: boolean;
  shrinkable?: boolean;
  padded?: boolean;
  paddedHorizontal?: boolean;
  paddedVertical?: boolean;
  limited?: boolean;
  scrollable?: boolean;
  center?: boolean;
  cover?: boolean;
  panX?: boolean;
  panY?: boolean;
  tiny?: boolean;
  small?: boolean;
  large?: boolean;
  extraLarge?: boolean;
  compact?: boolean;
  strong?: boolean;
  light?: boolean;
  thin?: boolean;
  italic?: boolean;
  lighter?: boolean;
  darker?: boolean;
  hideOnSmallScreens?: boolean;
  debug?: boolean;
  debug2?: boolean;
  debug3?: boolean;
  ignorePointerEvents?: boolean;
  mainAxisAlignment?: FlexAlignment;
  crossAxisAlignment?: FlexAlignment;
  selfAlignment?: FlexAlignment;
  flex?: string | number;
  className?: string;
  textAlign?: TextAlignment;
}

interface FlexRef {
  /**
   * Inner forwarded ref.
   *
   * @deprecated Use normal "ref" instead.
   */
  flexRef?: React.Ref<FlexElement>;
}

export type FlexProps<T extends FlexTag = "div"> = React.ComponentPropsWithoutRef<T> & FlexOptions & FlexRef;

// generic version, don't use directly, use <Flex/>, <P/> etc
export class FlexBase<T extends FlexTag = "div"> extends React.Component<FlexProps<T>> {
  tag: FlexTag = "div";

  render() {
    const {
      children,
      secondary,
      alternate,
      column,
      row,
      inline,
      nowrap,
      overflow,
      expanded,
      shrinkable,
      padded,
      paddedHorizontal,
      paddedVertical,
      limited,
      scrollable,
      center,
      cover,
      panX,
      panY,
      tiny,
      small,
      large,
      extraLarge,
      compact,
      strong,
      thin,
      italic,
      light,
      lighter,
      darker,
      hideOnSmallScreens,
      ignorePointerEvents,
      debug,
      debug2,
      debug3,
      mainAxisAlignment,
      crossAxisAlignment,
      selfAlignment,
      flex,
      className,
      textAlign,
      flexRef,
      ...rest
    } = this.props;

    // unable to suport scrollable and limited in a single element
    if (scrollable && limited) {
      throw new Error(
        "Please don't use scrollable and limited together but rather add another Flex element inside scrollable one that is limited",
      );
    }

    // no need to add shrinkable when already defined expanded
    if (expanded && shrinkable) {
      throw new Error("Please don't use expanded and schrinkable together as expanded already defaults to shrinkable");
    }

    // create jsx element with given tag name
    const element = React.createElement(this.tag) as JSX.Element;

    // some additional properties might exist but not available in the generic typings
    const onClick = (rest as any).onClick as React.MouseEvent<T> | undefined;
    const style = (rest as any).style as React.CSSProperties | undefined;

    const component = (
      <element.type
        ref={flexRef}
        style={{
          alignSelf: selfAlignment,
          textAlign: textAlign,
          flex,
          ...style,
        }}
        onClick={onClick}
        className={classNames(
          styles.flex,
          {
            // for some reason inline styles seem to mess up animation performance
            [styles["flex--justify-content-flex-start"]]: mainAxisAlignment === "flex-start",
            [styles["flex--justify-content-flex-end"]]: mainAxisAlignment === "flex-end",
            [styles["flex--justify-content-center"]]: mainAxisAlignment === "center",
            [styles["flex--justify-content-baseline"]]: mainAxisAlignment === "baseline",
            [styles["flex--justify-content-stretch"]]: mainAxisAlignment === "stretch",
            [styles["flex--justify-content-space-between"]]: mainAxisAlignment === "space-between",
            [styles["flex--justify-content-space-evenly"]]: mainAxisAlignment === "space-evenly",
            [styles["flex--align-items-flex-start"]]: crossAxisAlignment === "flex-start",
            [styles["flex--align-items-flex-end"]]: crossAxisAlignment === "flex-end",
            [styles["flex--align-items-center"]]: crossAxisAlignment === "center",
            [styles["flex--align-items-baseline"]]: crossAxisAlignment === "baseline",
            [styles["flex--align-items-stretch"]]: crossAxisAlignment === "stretch",
            [styles["flex--align-items-space-between"]]: crossAxisAlignment === "space-between",
            [styles["flex--align-items-space-evenly"]]: crossAxisAlignment === "space-evenly",
            [styles["flex--secondary"]]: secondary,
            [styles["flex--alternate"]]: alternate,
            [styles["flex--row"]]: row,
            [styles["flex--column"]]: column,
            [styles["flex--inline"]]: inline,
            [styles["flex--nowrap"]]: nowrap,
            [styles["flex--overflow"]]: overflow,
            [styles["flex--expanded"]]: expanded,
            [styles["flex--shrinkable"]]: shrinkable || expanded || scrollable, // expanded and scrollable are shrinkable by default
            [styles["flex--padded"]]: padded && !compact,
            [styles["flex--padded-horizontal"]]: paddedHorizontal && !compact,
            [styles["flex--padded-vertical"]]: paddedVertical && !compact,
            [styles["flex--padded-compact"]]: padded && compact,
            [styles["flex--padded-horizontal-compact"]]: paddedHorizontal && compact,
            [styles["flex--padded-vertical-compact"]]: paddedVertical && compact,
            [styles["flex--limited"]]: limited,
            [styles["flex--scrollable"]]: scrollable && !limited,
            [styles["flex--center-flex"]]: center && this.tag !== "p",
            [styles["flex--center-text"]]: center && this.tag === "p",
            [styles["flex--cover"]]: cover,
            [styles["flex--pan-x"]]: panX,
            [styles["flex--pan-y"]]: panY,
            [styles["flex--paragraph"]]: this.tag === "p",
            [styles["flex--span"]]: this.tag === "span",
            [styles["flex--tiny"]]: tiny,
            [styles["flex--small"]]: small,
            [styles["flex--large"]]: large,
            [styles["flex--extra-large"]]: extraLarge,
            [styles["flex--compact"]]: compact,
            [styles["flex--strong"]]: strong,
            [styles["flex--thin"]]: thin,
            [styles["flex--light"]]: light,
            [styles["flex--italic"]]: italic,
            [styles["flex--lighter"]]: lighter,
            [styles["flex--darker"]]: darker,
            [styles["flex--hide-on-small-screens"]]: hideOnSmallScreens,
            [styles["flex--ignore-pointer-events"]]: ignorePointerEvents,
            [styles["flex--debug"]]: debug,
            [styles["flex--debug2"]]: debug2,
            [styles["flex--debug3"]]: debug3,
            [styles["flex--has-click-handler"]]: onClick !== undefined,
          },
          className,
        )}
        {...rest}
      >
        {children}
      </element.type>
    );

    // wrap created flex element in limited width wrap if requested
    if (limited) {
      return (
        <Flex
          row
          overflow={overflow}
          expanded={expanded}
          cover={cover}
          scrollable={scrollable}
          ignorePointerEvents={ignorePointerEvents}
          mainAxisAlignment="center"
        >
          {component}
        </Flex>
      );
    }

    return component;
  }
}

export const Flex = React.forwardRef<FlexElement, FlexProps<"div">>(function Flex(props, ref) {
  return <FlexBase<"div"> {...props} flexRef={ref} />;
});
