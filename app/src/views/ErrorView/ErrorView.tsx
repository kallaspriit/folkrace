import React from "react";
import { BlockButton } from "../../components/BlockButton/BlockButton";
import { Column } from "../../components/Column/Column";
// import { Container } from "../../components/Container/Container";
import { Expanded } from "../../components/Expanded/Expanded";
import { GridBox } from "../../components/GridBox/GridBox";
// import Lottie from "../../components/Lottie/Lottie";
import { P } from "../../components/Paragraph/Paragraph";
import { TextButton } from "../../components/TextButton/TextButton";
import { View } from "../../components/View/View";
import { config } from "../../config";
// import errorAnimation from "../../theme/animations/error-animation.json";
import styles from "./ErrorView.module.scss";

export interface ErrorViewProps {
  error: Error | string;
  title?: string;
}

export const ErrorView: React.FC<ErrorViewProps> = ({ error, title }) => {
  const message =
    error instanceof Error
      ? config.debug
        ? error.message
        : "System error occured, we're working on the issue. Please try again later"
      : error;

  return (
    <View scrollable>
      <Column limited padded expanded className={styles["error-view"]}>
        <Expanded />
        <GridBox />
        <P center darker>
          {title || "Oops, something went wrong!"}
        </P>
        <GridBox />
        <P center small className={styles.message}>
          {message}
        </P>
        <GridBox />
        <Expanded />
        {/* <Container className={styles.animation}>
          <Lottie loop animationData={errorAnimation} />
        </Container>
        <Expanded /> */}
        <GridBox />
        <BlockButton onClick={() => (window.location.href = "/")}>Start over</BlockButton>
        <GridBox half />
        <TextButton onClick={() => window.location.reload()}>Attempt to reload</TextButton>
      </Column>
    </View>
  );
};
