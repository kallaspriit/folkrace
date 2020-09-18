import React from "react";
import { useHistory } from "react-router";
import { Page, PageList } from "../../components/PageList/PageList";
import { MAIN_MENU_VIEW_PATH, MainMenuViewParams } from "../../routes";
import { buildPath } from "../../services/buildPath";
import { ConfigureConnectionView } from "../ConfigureConnectionView/ConfigureConnectionView";
import { ExperimentsView } from "../ExperimentsView/ExperimentsView";

const pages: Page[] = [
  {
    name: "connection",
    title: "Configure connection",
    page: <ConfigureConnectionView />,
  },
  {
    name: "experiments",
    title: "Experiments",
    page: <ExperimentsView />,
  },
];

export const SettingsView: React.FC = () => {
  const history = useHistory();

  return (
    <PageList
      title="Settings"
      pages={pages}
      onBack={() => history.goBack()}
      buildPagePath={(page, removeOptional) =>
        buildPath<MainMenuViewParams>(
          MAIN_MENU_VIEW_PATH,
          {
            menu: "settings",
            page: page.name,
          },
          removeOptional,
        )
      }
    />
  );
};
