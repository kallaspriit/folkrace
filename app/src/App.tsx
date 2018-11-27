import * as React from "react";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import { Provider } from "unstated";
import { ThemeProvider } from "styled-components";

import { ConnectionManager } from "./components/ConnectionManager";
import { MainMenu } from "./components/MainMenu";
import BotView from "./views/BotView";
import MapView from "./views/MapView";
import RemoteView from "./views/RemoteView";
import SettingsView from "./views/SettingsView";
import StatusView from "./views/StatusView";
import { theme, styled, GlobalStyle } from "./styled";

const AppWrap = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  animation: ${props => props.theme.animation.fadeIn} 300ms;
`;

class App extends React.Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Provider>
          <GlobalStyle />
          <ConnectionManager />
          <Router>
            <AppWrap>
              <Switch>
                <Route path="/status" component={StatusView} />
                <Route path="/map" component={MapView} />
                <Route path="/remote" component={RemoteView} />
                <Route path="/bot" component={BotView} />
                <Route path="/settings" component={SettingsView} />
                <Route exact={true} path="/">
                  <Redirect to="/status" />
                </Route>
              </Switch>
              <MainMenu />
            </AppWrap>
          </Router>
        </Provider>
      </ThemeProvider>
    );
  }
}

export default App;
