import React from "react";
import { Container } from "../Container/Container";
import { Row } from "./Row";

export default {
  title: "Row",
  component: Row,
};

export const WithSimpleDivs = () => (
  <Row debug>
    <div>A</div>
    <div>B</div>
    <div>C</div>
  </Row>
);

export const WithContainers = () => (
  <Row debug>
    <Container debug2>A</Container>
    <Container debug2>B</Container>
    <Container debug2>C</Container>
  </Row>
);

export const WithInline = () => (
  <Row inline debug>
    <Container debug2 expanded>
      A
    </Container>
    <Container debug2 expanded>
      B
    </Container>
    <Container debug2 expanded>
      C
    </Container>
  </Row>
);

export const WithSize = () => (
  <Row debug style={{ width: "400px", height: "300px" }}>
    <Container debug2 expanded center>
      A
    </Container>
    <Container debug2 expanded center>
      B
    </Container>
    <Container debug2 expanded center>
      C
    </Container>
  </Row>
);
