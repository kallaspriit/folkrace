import React from "react";
import { P } from "../Paragraph/Paragraph";
import { Span } from "./Span";

export default {
  title: "Span",
  component: Span,
};

export const WithText = () => <Span>Hello world!</Span>;

export const WithStrong = () => <Span strong>Hello world!</Span>;

export const InParagraph = () => (
  <P>
    Hello <Span strong>world!</Span>
  </P>
);
