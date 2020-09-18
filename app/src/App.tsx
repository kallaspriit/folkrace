import React from "react";
import { Route, Switch, Redirect } from "react-router";
import { BrowserRouter as Router } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { CONFIGURE_CONNECTION_VIEW_PATH, MAIN_MENU_VIEW_PATH, MainMenuViewParams } from "./routes";
import { buildUrl } from "./services/buildUrl";
import { websocketHostState } from "./state/websocketHostState";
import { ConfigureConnectionView } from "./views/ConfigureConnectionView/ConfigureConnectionView";
import { MainMenuView } from "./views/MainMenuView/MainMenuView";
import { NotFoundView } from "./views/NotFoundView/NotFoundView";

export const App: React.FC = () => {
  // decide where to redirect index path
  const websocketHost = useRecoilValue(websocketHostState);
  const isWebsocketHostDefined = websocketHost !== undefined;
  const rootRedirectPath = isWebsocketHostDefined
    ? buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, { menu: "status" })
    : buildUrl(CONFIGURE_CONNECTION_VIEW_PATH);

  return (
    <Router>
      <Switch>
        <Route exact path="/">
          <Redirect to={rootRedirectPath} />
        </Route>
        <Route path={MAIN_MENU_VIEW_PATH}>
          <MainMenuView />
        </Route>
        <Route path={CONFIGURE_CONNECTION_VIEW_PATH}>
          <ConfigureConnectionView />
        </Route>
        <Route>
          <NotFoundView />
        </Route>
      </Switch>
    </Router>
  );
};
