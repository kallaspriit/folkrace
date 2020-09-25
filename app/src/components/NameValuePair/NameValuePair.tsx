import React from "react";
import { P } from "../Paragraph/Paragraph";
import { Row } from "../Row/Row";

export interface NameValuePairProps {
  name: React.ReactNode;
  vertical?: boolean;
}

export const NameValuePair: React.FC<NameValuePairProps> = ({ name, vertical, children }) => {
  if (vertical) {
    return (
      <>
        <P>{name}</P>
        {typeof children === "string" ? <P small>{children}</P> : children}
      </>
    );
  }

  return (
    <Row mainAxisAlignment="space-between">
      {typeof name === "string" ? <P>{name}</P> : name}
      {typeof children === "string" ? <P>{children}</P> : children}
    </Row>
  );
};
