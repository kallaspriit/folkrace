import classNames from "classnames";
import React from "react";
import { Container } from "../Container/Container";
import styles from "./Loading.module.scss";

export type LoadingSize = "small" | "medium" | "large";

export interface LoadingProps {
  small?: boolean;
  large?: boolean;
  className?: string;
}

export const Loading: React.FC<LoadingProps> = ({ small, large, className }) => (
  <Container
    className={classNames(
      styles.loading,
      {
        [styles["loading--size-small"]]: small,
        [styles["loading--size-large"]]: large,
      },
      className,
    )}
  >
    <LoadingIndicator />
  </Container>
);

export interface LoadingIndicatorProps extends React.ComponentPropsWithoutRef<"svg"> {
  segmentCount?: number;
  segmentWidth?: number;
  segmentLength?: number;
  spacing?: number;
  fadeSteps?: number;
  fadeTo?: number;
  segmentColor?: {
    red: number;
    green: number;
    blue: number;
    alpha: number;
  };
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  segmentCount = 12,
  segmentWidth = 2,
  segmentLength = 5,
  spacing = 3,
  fadeSteps = 11,
  fadeTo = 31 / 98,
  segmentColor = {
    red: 0,
    green: 0,
    blue: 0,
    alpha: 98 / 255,
  },
  className,
  ...rest
}) => {
  const innerRadius = segmentWidth * 2 + spacing;
  const opacityDelta = (1 - fadeTo) / fadeSteps;
  const segments = [];

  for (let i = 0; i < segmentCount; i++) {
    const opacity = 1 - Math.min(i, fadeSteps) * opacityDelta;
    const rotation = (-i * 360) / segmentCount;

    segments.push(
      <line
        key={i}
        x1="0"
        y1={innerRadius}
        x2="0"
        y2={innerRadius + segmentLength}
        style={{ opacity: opacity }}
        transform={`rotate(${rotation})`}
      />,
    );
  }

  const { red, green, blue, alpha } = segmentColor;
  const rgbaColor = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  const radius = innerRadius + segmentLength + Math.ceil(segmentWidth / 2);
  const size = radius * 2;

  return (
    <svg
      className={classNames(styles["loading-indicator"], className)}
      viewBox={`0 0 ${size} ${size}`}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <g
        stroke={rgbaColor}
        strokeWidth={segmentWidth}
        strokeLinecap="round"
        transform={`translate(${radius}, ${radius})`}
      >
        {segments}
      </g>
    </svg>
  );
};
