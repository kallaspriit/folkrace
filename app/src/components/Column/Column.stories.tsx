import React from "react";
import { Container } from "../Container/Container";
import { Row } from "../Row/Row";
import { Column } from "./Column";

export default {
  title: "Column",
  component: Column,
};

export const WithSimpleDivs = () => (
  <Column debug>
    <div>A</div>
    <div>B</div>
    <div>C</div>
  </Column>
);

export const WithContainers = () => (
  <Column debug>
    <Container debug>A</Container>
    <Container debug>B</Container>
    <Container debug>C</Container>
  </Column>
);

export const WithInline = () => (
  <Column inline debug>
    <Container debug>A</Container>
    <Container debug>B</Container>
    <Container debug>C</Container>
  </Column>
);

export const WithSize = () => (
  <Column debug style={{ width: "400px", height: "300px" }}>
    <Container center debug>
      A
    </Container>
    <Container center debug>
      B
    </Container>
    <Container center debug>
      C
    </Container>
  </Column>
);

export const InRow = () => (
  <Row debug style={{ width: "400px" }}>
    <Column expanded debug>
      <Container center debug>
        A
      </Container>
      <Container center debug>
        B
      </Container>
      <Container center debug>
        C
      </Container>
    </Column>
    <Column expanded debug>
      <Container center debug>
        D
      </Container>
      <Container center debug>
        E
      </Container>
      <Container center debug>
        F
      </Container>
      <Container center debug>
        G
      </Container>
    </Column>
  </Row>
);
