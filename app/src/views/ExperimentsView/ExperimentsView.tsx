import React from "react";
import { useHistory } from "react-router-dom";
import { PageList, Page } from "../../components/PageList/PageList";
import { MainMenuViewParams, MAIN_MENU_VIEW_PATH } from "../../routes";
import { buildPath } from "../../services/buildPath";
import { LogExperiment } from "./LogExperiment";
import { MainMenuExperiment } from "./MainMenuExperiment";
import { SoundExperiment } from "./SoundExperiment";
import { StateExperiment } from "./StateExperiment";
import { TransportExperiment } from "./TransportExperiment";

const pages: Page[] = [
  {
    name: "transport",
    title: "Transport experiment",
    page: <TransportExperiment />,
  },
  {
    name: "log",
    title: "Log experiment",
    page: <LogExperiment />,
  },
  {
    name: "state",
    title: "State experiment",
    page: <StateExperiment />,
  },
  {
    name: "sound",
    title: "Sound experiment",
    page: <SoundExperiment />,
  },
  {
    name: "main-menu",
    title: "Main menu experiment",
    page: <MainMenuExperiment />,
  },
];

export const ExperimentsView: React.FC = () => {
  const history = useHistory();

  return (
    <PageList
      title="Experiments"
      pages={pages}
      onBack={() => history.replace("/")}
      buildPagePath={(page, removeOptional) =>
        buildPath<MainMenuViewParams>(
          MAIN_MENU_VIEW_PATH,
          {
            menu: "settings",
            page: "experiments",
            modifier: page.name,
          },
          removeOptional,
        )
      }
    />
  );
};
