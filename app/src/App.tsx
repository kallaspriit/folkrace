import React from "react";
import { Route, Switch, Redirect } from "react-router";
import { BrowserRouter as Router } from "react-router-dom";
import { DASHBOARD_VIEW_PATH, EXPERIMENTS_VIEW_PATH, CONFIGURE_CONNECTION_VIEW_PATH } from "./routes";
import { buildUrl } from "./services/buildUrl";
import { getWebsocketHost } from "./services/getWebsocketHost";
import { ConfigureConnectionView } from "./views/ConfigureConnectionView/ConfigureConnectionView";
import { DashboardView } from "./views/DashboardView/DashboardView";
import { ExperimentsView } from "./views/ExperimentsView/ExperimentsView";
import { NotFoundView } from "./views/NotFoundView/NotFoundView";

export const App: React.FC = () => {
  // decide where to redirect root path
  const isWebsocketHostDefined = getWebsocketHost() !== undefined;
  const rootRedirectPath = isWebsocketHostDefined
    ? buildUrl(DASHBOARD_VIEW_PATH)
    : buildUrl(CONFIGURE_CONNECTION_VIEW_PATH);

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Redirect to={rootRedirectPath} />
        </Route>
        <Route path={DASHBOARD_VIEW_PATH}>
          <DashboardView />
        </Route>
        <Route path={CONFIGURE_CONNECTION_VIEW_PATH}>
          <ConfigureConnectionView />
        </Route>
        <Route path={EXPERIMENTS_VIEW_PATH}>
          <ExperimentsView />
        </Route>
        <Route>
          <NotFoundView />
        </Route>
      </Switch>
    </Router>
  );
};
