import * as React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import { Provider } from "unstated";

import Glue from "./components/glue/Glue";
import MainMenu from "./components/main-menu/MainMenu";
import BotView from "./views/bot/BotView";
import MapView from "./views/map/MapView";
import RemoteView from "./views/remote/RemoteView";
import SettingsView from "./views/settings/SettingsView";
import StatusView from "./views/status/StatusView";

class App extends React.Component {
  render() {
    return (
      <Provider>
        <Glue />
        <Router>
          <div className="app">
            <Switch>
              <Route path="/status" component={StatusView} />
              <Route path="/map" component={MapView} />
              <Route path="/remote" component={RemoteView} />
              <Route path="/ai" component={BotView} />
              <Route path="/settings" component={SettingsView} />
              <Route exact={true} path="/">
                <Redirect to="/status" />
              </Route>
            </Switch>
            <MainMenu />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
