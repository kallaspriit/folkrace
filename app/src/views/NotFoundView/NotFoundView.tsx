import React from "react";
import { ErrorView } from "../ErrorView/ErrorView";

export const NotFoundView: React.FC = () => (
  <ErrorView title="Not found" error="Requested page could not be found or You don't have the required permissions." />
);
