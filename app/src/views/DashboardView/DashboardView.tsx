import React from "react";
import { useHistory } from "react-router";
import { BlockButton } from "../../components/BlockButton/BlockButton";
import { View } from "../../components/View/View";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";

export const DashboardView: React.FC = () => {
  const history = useHistory();

  return (
    <View padded>
      <BlockButton onClick={() => history.push(buildUrl<ExperimentsViewParams>(EXPERIMENTS_VIEW_PATH))}>
        Open experiments
      </BlockButton>
    </View>
  );
};
