import React, { useState } from "react";
import { BlockButton } from "../BlockButton/BlockButton";
import { Column } from "../Column/Column";
import { P } from "../Paragraph/Paragraph";
import { RenderCount } from "./RenderCount";

export default {
  title: "RenderCount",
  component: RenderCount,
};

export const Default = () => {
  const [randomNumber, setRandomNumber] = useState(Math.random());

  return (
    <Column>
      <RenderCount label="story" />
      <P>Random number: {randomNumber}</P>
      <BlockButton onClick={() => setRandomNumber(Math.random())}>Generate new random number</BlockButton>
    </Column>
  );
};
