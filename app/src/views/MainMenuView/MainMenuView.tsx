import React, { useCallback } from "react";
import { useHistory, useRouteMatch, Redirect, Switch, Route } from "react-router-dom";
import { Container } from "../../components/Container/Container";
import { MainMenu, MainMenuItem } from "../../components/MainMenu/MainMenu";
import { View } from "../../components/View/View";
import { useDisableScrolling } from "../../hooks/useDisableScrolling";
import { MainMenuViewMenu, MainMenuViewParams, MAIN_MENU_VIEW_PATH } from "../../routes";
import { buildPath } from "../../services/buildPath";
import { buildUrl } from "../../services/buildUrl";
import { ReactComponent as ControllerIcon } from "../../theme/icons/controller-icon.svg";
import { ReactComponent as MapIcon } from "../../theme/icons/map-icon.svg";
import { ReactComponent as RemoteIcon } from "../../theme/icons/remote-icon.svg";
import { ReactComponent as SettingsIcon } from "../../theme/icons/settings-icon.svg";
import { ReactComponent as StatusIcon } from "../../theme/icons/status-icon.svg";
import { ControllerView } from "../ControllerView/ControllerView";
import { MapView } from "../MapView/MapView";
import { RemoteView } from "../RemoteView/RemoteView";
import { SettingsView } from "../SettingsView/SettingsView";
import { StatusView } from "../StatusView/StatusView";

interface MenuInfo {
  name: MainMenuViewMenu;
  page?: string;
  title: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const menus: MenuInfo[] = [
  {
    name: "status",
    title: "Status",
    icon: <StatusIcon />,
    content: <StatusView />,
  },
  {
    name: "map",
    title: "Map",
    icon: <MapIcon />,
    content: <MapView />,
  },
  {
    name: "controller",
    title: "Controller",
    icon: <ControllerIcon />,
    content: <ControllerView />,
  },
  {
    name: "remote",
    title: "Remote",
    icon: <RemoteIcon />,
    content: <RemoteView />,
  },
  {
    name: "settings",
    title: "Settings",
    icon: <SettingsIcon />,
    content: <SettingsView />,
  },
];

const defaultMenu = menus[0];

export const MainMenuView: React.FC = () => {
  const { params } = useRouteMatch<MainMenuViewParams>();
  const history = useHistory();

  // useDisableScrolling();

  const activeMenuInfo = getMenuByName(params.menu);

  const handleMainMenuItemClick = useCallback(
    (index: number) => {
      const menu = getMenuByIndex(index);

      history.push(
        buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, { menu: menu.name, page: menu.page }),
      );
    },
    [history],
  );

  // redirect to default menu if none could by found by name
  if (!activeMenuInfo) {
    return <Redirect to={buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, { menu: defaultMenu.name })} />;
  }

  const activeMenuIndex = menus.indexOf(activeMenuInfo);

  return (
    <View>
      <Container expanded>
        <Switch>
          {menus.map((menu) => (
            <Route key={menu.name} path={buildPath<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, { menu: menu.name })}>
              {menu.content}
            </Route>
          ))}
        </Switch>
      </Container>
      <MainMenu activeItemIndex={activeMenuIndex} onItemClick={handleMainMenuItemClick}>
        {menus.map((menu) => (
          <MainMenuItem key={menu.name} icon={menu.icon}>
            {menu.title}
          </MainMenuItem>
        ))}
      </MainMenu>
    </View>
  );
};

function getMenuByName(name?: string) {
  return menus.find((menu) => menu.name === name);
}

function getMenuByIndex(index: number) {
  const menu = menus[index];

  if (!menu) {
    throw new Error(`Menu with index "${index}" does not exist, this should not happen`);
  }

  return menu;
}
