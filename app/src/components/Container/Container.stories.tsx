import React from "react";
import { Stack } from "../Stack/Stack";
import { Container } from "./Container";

export default {
  title: "Container",
  component: Container,
};

export const Default = () => <Container debug>Hello World!</Container>;

export const WithLargeText = () => (
  <Stack referenceFirstChild>
    <Container debug style={{ fontSize: "10rem" }}>
      Hello World!
    </Container>
    {/* Draw line through the middle */}
    <Container>
      <div style={{ height: "1px", backgroundColor: "#F00", position: "absolute", top: "50%", width: "100%" }}></div>
    </Container>
  </Stack>
);

export const WithLargeTextAndParagraph = () => (
  <Stack referenceFirstChild>
    <Container debug paragraph style={{ fontSize: "10rem" }}>
      Hello World!
    </Container>
    {/* Draw line through the middle */}
    <Container>
      <div style={{ height: "1px", backgroundColor: "#F00", position: "absolute", top: "50%", width: "100%" }}></div>
    </Container>
  </Stack>
);

export const WithMultipleChildren = () => (
  <Container debug>
    <div>First row</div>
    <div>Second row</div>
  </Container>
);

export const WithSizeAndCenter = () => (
  <Container debug center style={{ width: "400px", height: "300px" }}>
    Hello
  </Container>
);
