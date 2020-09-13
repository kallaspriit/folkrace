import React from "react";
import { Route, Switch, Redirect } from "react-router";
import { BrowserRouter as Router } from "react-router-dom";
import { Version } from "./components/Version/Version";
import { DASHBOARD_VIEW_PATH, EXPERIMENTS_VIEW_PATH } from "./routes";
import { buildUrl } from "./services/buildUrl";
import { DashboardView } from "./views/DashboardView/DashboardView";
import { ExperimentsView } from "./views/ExperimentsView/ExperimentsView";
import { NotFoundView } from "./views/NotFoundView/NotFoundView";

export const App: React.FC = () => (
  <>
    <Router>
      <Switch>
        <Route exact path="/">
          <Redirect to={buildUrl(DASHBOARD_VIEW_PATH)} />
        </Route>
        <Route path={DASHBOARD_VIEW_PATH}>
          <DashboardView />
        </Route>
        <Route path={EXPERIMENTS_VIEW_PATH}>
          <ExperimentsView />
        </Route>
        <Route>
          <NotFoundView />
        </Route>
      </Switch>
    </Router>
    <Version />
  </>
);
