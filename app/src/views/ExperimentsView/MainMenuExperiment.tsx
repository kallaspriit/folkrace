import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Container } from "../../components/Container/Container";
import { MainMenu, MainMenuItem } from "../../components/MainMenu/MainMenu";
import { PageView } from "../../components/PageView/PageView";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { useDisableScrolling } from "../../hooks/useDisableScrolling";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { ReactComponent as ControllerIcon } from "../../theme/icons/controller-icon.svg";
import { ReactComponent as MapIcon } from "../../theme/icons/map-icon.svg";
import { ReactComponent as RemoteIcon } from "../../theme/icons/remote-icon.svg";
import { ReactComponent as SettingsIcon } from "../../theme/icons/settings-icon.svg";
import { ReactComponent as StatusIcon } from "../../theme/icons/status-icon.svg";

export const MainMenuExperiment: React.FC = () => {
  const [activeItemIndex, setActiveItemIndex] = useState(0);
  const history = useHistory();

  useDisableScrolling();

  return (
    <View>
      <TitleBar
        onBack={() => history.replace(buildUrl<ExperimentsViewParams>(EXPERIMENTS_VIEW_PATH))}
        title="Main menu experiment"
      />
      <PageView
        expanded
        pageCount={5}
        activePageIndex={activeItemIndex}
        buildPage={(pageIndex) => (
          <Container cover center>
            Page {pageIndex}
          </Container>
        )}
      />
      <MainMenu activeItemIndex={activeItemIndex} onItemClick={setActiveItemIndex}>
        <MainMenuItem icon={<StatusIcon />}>Status</MainMenuItem>
        <MainMenuItem icon={<MapIcon />}>Map</MainMenuItem>
        <MainMenuItem icon={<ControllerIcon />}>Controller</MainMenuItem>
        <MainMenuItem icon={<RemoteIcon />}>Remote</MainMenuItem>
        <MainMenuItem icon={<SettingsIcon />}>Settings</MainMenuItem>
      </MainMenu>
    </View>
  );
};
