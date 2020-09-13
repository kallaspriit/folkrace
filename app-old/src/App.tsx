import React from "react";
import { BrowserRouter, Redirect, Route, Switch } from "react-router-dom";
import styled, { ThemeProvider } from "styled-components";
import { Provider } from "unstated";

import { Hub } from "./components/Hub";
import { MainMenu } from "./components/MainMenu";
import { GlobalStyle, theme } from "./theme";
import { MapView } from "./views/MapView";
import { RemoteView } from "./views/RemoteView";
import { SettingsView } from "./views/SettingsView";
import { SimulationView } from "./views/SimulationView";
import { StatusView } from "./views/StatusView";

export class App extends React.Component {
  render() {
    return (
      <ThemeProvider theme={theme}>
        <Provider>
          <GlobalStyle />
          <Hub />
          <BrowserRouter>
            <AppWrap>
              <Switch>
                <Route path="/status" component={StatusView} />
                <Route path="/map" component={MapView} />
                <Route path="/remote" component={RemoteView} />
                <Route path="/simulation" component={SimulationView} />
                <Route path="/settings" component={SettingsView} />
                <Route>
                  <Redirect to="/status" />
                </Route>
              </Switch>
              <MainMenu />
            </AppWrap>
          </BrowserRouter>
        </Provider>
      </ThemeProvider>
    );
  }
}

const AppWrap = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  animation: ${(props) => props.theme.animation.fadeIn} 1000ms;
`;
