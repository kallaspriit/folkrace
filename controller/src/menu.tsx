import * as React from "react";
import * as ReactDOM from "react-dom";

export interface HelloProps {
  name: string;
}

export const Hello = (props: HelloProps) => <h1>Hello {props.name}!</h1>;

ReactDOM.render(<Hello name="FolkBot" />, document.getElementById("root"));
