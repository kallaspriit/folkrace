import React from "react";
import { NameValuePair } from "../NameValuePair/NameValuePair";

export interface RenderCountProps {
  label: string;
}

export const RenderCount: React.FC<RenderCountProps> = ({ label }) => {
  const renderCount = useRenderCount(label);

  return <NameValuePair name="Render count" value={renderCount} />;
};

const renderCountMap: Record<string, number | undefined> = {};

export function useRenderCount(label: string): number {
  // using useRef(0) would trigger another render so use a simple counter
  const renderCount = renderCountMap[label];

  if (renderCount !== undefined) {
    renderCountMap[label] = renderCount + 1;
  } else {
    renderCountMap[label] = 1;
  }

  return renderCountMap[label] as number;
}
