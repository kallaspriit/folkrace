import { render } from "@testing-library/react";
import React from "react";
import { Root } from "./Root";

test("renders learn react link", () => {
  const { getByText } = render(<Root />);
  const linkElement = getByText(/experiments/i);
  expect(linkElement).toBeInTheDocument();
});
