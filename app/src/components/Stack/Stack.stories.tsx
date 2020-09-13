import React from "react";
import { Column } from "../Column/Column";
import { Container } from "../Container/Container";
import { Loading } from "../Loading/Loading";
import { Stack } from "./Stack";

export default {
  title: "Stack",
  component: Stack,
};

export const WithSimpleDivs = () => (
  <Stack debug>
    <div>A</div>
    <div>B</div>
  </Stack>
);

export const WithReferenceFirstChild = () => (
  <Stack debug referenceFirstChild>
    <Container debug center style={{ height: "200px" }}>
      A
    </Container>
    <Container debug>B</Container>
  </Stack>
);

export const WithSizedContainers = () => (
  <Stack referenceFirstChild>
    {/* First child dictates the size */}
    <Container center debug style={{ width: "400px", height: "300px" }}>
      Hello
    </Container>
    {/* Other children are absolutely positioned on top of the previous ones */}
    <Container center debug>
      <Loading large />
    </Container>
    <Column mainAxisAlignment="flex-end" crossAxisAlignment="flex-end">
      <Container debug>Cool</Container>
    </Column>
  </Stack>
);

export const WithSizedParent = () => (
  <div style={{ width: "800px", height: "600px", outline: "5px solid green" }}>
    <Stack>
      {/* First child dictates the size */}
      <Container center debug>
        Hello
      </Container>
      {/* Other children are absolutely positioned on top of the previous ones */}
      <Container center debug>
        <Loading large />
      </Container>
      <Column mainAxisAlignment="flex-end" crossAxisAlignment="flex-end">
        <Container debug>Cool</Container>
      </Column>
    </Stack>
  </div>
);
