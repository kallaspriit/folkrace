import React from "react";
import { usePrevious } from "../../hooks/usePrevious";
import { Container } from "../Container/Container";
import { FlexProps } from "../Flex/Flex";
import styles from "./PageView.module.scss";

export interface PageViewStats {
  isActive: boolean;
  isPrevious: boolean;
  isVisible: boolean;
  activePageIndex: number;
  previousPageIndex: number | undefined;
  distance: number;
}

export type GeneratePageFn = (pageIndex: number, stats: PageViewStats) => React.ReactNode;

export interface PageViewProps extends FlexProps {
  pageCount: number;
  activePageIndex: number;
  buildPage: GeneratePageFn;
}

export const PageView: React.FC<PageViewProps> = ({ pageCount, activePageIndex, buildPage, ...rest }) => {
  const previousPageIndex = usePrevious(activePageIndex);

  if (activePageIndex < 0) {
    throw new Error("Expected active page index to be positive");
  }

  if (pageCount !== undefined && activePageIndex > pageCount - 1) {
    throw new Error(`Expected active page index to be between 0 and ${pageCount - 1}, got ${activePageIndex}`);
  }

  const position = activePageIndex * -100;

  return (
    <Container className={styles.viewport} {...rest}>
      <div className={styles.slider} style={{ transform: `translate3d(${position}%, 0px, 0px)` }}>
        {Array(pageCount)
          .fill(null)
          .map((_, index) => {
            const distance = Math.abs(index - activePageIndex);
            const isActive = index === activePageIndex;
            const isPrevious = index === previousPageIndex;
            const isVisible = isActive || isPrevious;

            const page = buildPage(index, {
              isActive,
              isPrevious,
              isVisible,
              activePageIndex,
              previousPageIndex,
              distance,
            });

            return (
              <Container cover key={index} style={{ left: `${index * 100}%` }}>
                {page}
              </Container>
            );
          })}
      </div>
    </Container>
  );
};
