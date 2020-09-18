import React from "react";
import { P } from "../Paragraph/Paragraph";
import { Row } from "../Row/Row";

export interface NameValuePairProps {
  name: React.ReactNode;
  value: React.ReactNode;
}

export const NameValuePair: React.FC<NameValuePairProps> = ({ name, value }) => (
  <Row mainAxisAlignment="space-between">
    {typeof name === "string" ? <P>{name}</P> : name}
    {typeof value === "string" ? <P>{value}</P> : value}
  </Row>
);
