import React from "react";
import { useHistory } from "react-router-dom";
import { Column } from "../../components/Column/Column";
import { ListItem, List, ListTitle } from "../../components/List/List";
import { P } from "../../components/Paragraph/Paragraph";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";

export const TransportExperiment: React.FC = () => {
  const history = useHistory();

  return (
    <View>
      <TitleBar
        onBack={() => history.replace(buildUrl<ExperimentsViewParams>(EXPERIMENTS_VIEW_PATH))}
        title="Transport experiment"
      />
      <Column expanded scrollable>
        <ListTitle>Choose language</ListTitle>
        <List>
          <ListItem removeTrailing>
            <P>Test</P>
          </ListItem>
        </List>
      </Column>
    </View>
  );
};
