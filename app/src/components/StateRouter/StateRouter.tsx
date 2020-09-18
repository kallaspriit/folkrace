import React from "react";
import { useStateRouter } from "../../hooks/useStateRouter";

export const StateRouter: React.FC = () => {
  // listens for events from multi-transport and forwards it to state
  useStateRouter();

  return null;
};
