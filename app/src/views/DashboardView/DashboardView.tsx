import React from "react";
import { useHistory } from "react-router";
import { useRecoilValue } from "recoil";
import { BlockButton } from "../../components/BlockButton/BlockButton";
import { Expanded } from "../../components/Expanded/Expanded";
import { GridBox } from "../../components/GridBox/GridBox";
import { NameValuePair } from "../../components/NameValuePair/NameValuePair";
import { View } from "../../components/View/View";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH, CONFIGURE_CONNECTION_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { transportStatusState } from "../../state/transportStatusState";

export const DashboardView: React.FC = () => {
  const history = useHistory();
  const transportStatus = useRecoilValue(transportStatusState);

  console.log("DashboardView");

  return (
    <View padded>
      <NameValuePair name="Transport status" value={transportStatus} />
      <Expanded />
      <BlockButton onClick={() => history.push(buildUrl<ExperimentsViewParams>(EXPERIMENTS_VIEW_PATH))}>
        Open experiments
      </BlockButton>
      <GridBox half />
      <BlockButton onClick={() => history.push(buildUrl<ExperimentsViewParams>(CONFIGURE_CONNECTION_VIEW_PATH))}>
        Configure connection
      </BlockButton>
    </View>
  );
};
