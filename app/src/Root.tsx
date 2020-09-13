import React from "react";
import { RecoilRoot } from "recoil";
import { App } from "./App";
import "./theme/main.scss";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { LoadingView } from "./views/LoadingView/LoadingView";

export const Root: React.FC = () => (
  <React.StrictMode>
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingView />}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
    </RecoilRoot>
  </React.StrictMode>
);
