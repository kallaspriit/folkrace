import React from "react";
import { useHistory } from "react-router-dom";
import { PageList, Page } from "../../components/PageList/PageList";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildPath } from "../../services/buildPath";
import { TransportExperiment } from "./TransportExperiment";

const pages: Page[] = [
  {
    name: "transport",
    title: "Transport experiment",
    page: <TransportExperiment />,
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
        buildPath<ExperimentsViewParams>(
          EXPERIMENTS_VIEW_PATH,
          {
            experiment: page.name,
          },
          removeOptional,
        )
      }
    />
  );
};
