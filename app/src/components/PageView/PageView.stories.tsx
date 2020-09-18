import React, { useState } from "react";
import { LoadingView } from "../../views/LoadingView/LoadingView";
import { BlockButton } from "../BlockButton/BlockButton";
import { ButtonGroup, ButtonGroupButton } from "../ButtonGroup/ButtonGroup";
import { Column } from "../Column/Column";
import { Container } from "../Container/Container";
import { Expanded } from "../Expanded/Expanded";
import { P } from "../Paragraph/Paragraph";
import { useRenderCount } from "../RenderCount/RenderCount";
import { View } from "../View/View";
import { PageView } from "./PageView";

export default {
  title: "PageView",
  component: PageView,
};

export const StepsExample = () => {
  const [activePageIndex, setActivePageIndex] = useState(0);

  return (
    <View padded limited>
      <PageView
        expanded
        pageCount={3}
        activePageIndex={activePageIndex}
        buildPage={(pageIndex) => {
          switch (pageIndex) {
            case 0:
              return (
                <CarouselPage>
                  <Container expanded>First page</Container>
                  <BlockButton onClick={() => setActivePageIndex(activePageIndex + 1)}>To second page</BlockButton>
                </CarouselPage>
              );

            case 1:
              return (
                <CarouselPage>
                  <Container expanded>Second page</Container>
                  <BlockButton onClick={() => setActivePageIndex(activePageIndex + 1)}>To third page</BlockButton>
                </CarouselPage>
              );

            case 2:
              return (
                <CarouselPage>
                  <Container expanded>Third page</Container>
                  <BlockButton onClick={() => setActivePageIndex(0)}>To first page</BlockButton>
                </CarouselPage>
              );

            default:
              throw new Error(`Unexpected page index #${pageIndex}`);
          }
        }}
      />
    </View>
  );
};

export const NavigationExample = () => {
  const pageCount = 5;
  const [activePageIndex, setActivePageIndex] = useState(0);

  return (
    <View>
      <PageView
        expanded
        pageCount={pageCount}
        activePageIndex={activePageIndex}
        buildPage={(pageIndex, { isActive, isPrevious, isVisible }) => {
          return isVisible ? (
            <Column cover center debug2={isActive} debug={isPrevious}>
              Page #{pageIndex}
            </Column>
          ) : (
            <LoadingView />
          );
        }}
      />
      <ButtonGroup>
        <ButtonGroupButton secondary onClick={() => setActivePageIndex(0)}>
          First page
        </ButtonGroupButton>
        <ButtonGroupButton
          tertiary={activePageIndex > 0}
          onClick={() => (activePageIndex > 0 ? setActivePageIndex(activePageIndex - 1) : undefined)}
        >
          Previous page
        </ButtonGroupButton>
        <ButtonGroupButton
          tertiary={activePageIndex < pageCount - 1}
          onClick={() => (activePageIndex < pageCount - 1 ? setActivePageIndex(activePageIndex + 1) : undefined)}
        >
          Next page
        </ButtonGroupButton>
      </ButtonGroup>
    </View>
  );
};

const CarouselPage: React.FC = ({ children, ...rest }) => {
  const renderCount = useRenderCount("CarouselPage");

  return (
    <Column cover center {...rest}>
      <Expanded />
      <P>Renders: {renderCount}</P>
      {children}
    </Column>
  );
};
