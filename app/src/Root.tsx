import React from "react";
import { RecoilRoot } from "recoil";
import { App } from "./App";
import "./theme/main.scss";
import ErrorBoundary from "./components/ErrorBoundary/ErrorBoundary";
import { LowBatteryAlarm } from "./components/LowBatteryAlarm/LowBatteryAlarm";
import { StateRouter } from "./components/StateRouter/StateRouter";
import { LoadingView } from "./views/LoadingView/LoadingView";

export const Root: React.FC = () => (
  <React.StrictMode>
    <RecoilRoot>
      <ErrorBoundary>
        <React.Suspense fallback={<LoadingView />}>
          <App />
        </React.Suspense>
      </ErrorBoundary>
      <StateRouter />
      <LowBatteryAlarm />
    </RecoilRoot>
  </React.StrictMode>
);
