import React, { useState } from "react";
import { useDisableScrolling } from "../../hooks/useDisableScrolling";
import { ReactComponent as JourneysIcon } from "../../theme/icons/main-menu-journeys-icon.svg";
import { ReactComponent as PregnancyIcon } from "../../theme/icons/main-menu-pregnancy-icon.svg";
import { ReactComponent as ProfileIcon } from "../../theme/icons/main-menu-profile-icon.svg";
import { ReactComponent as VideosIcon } from "../../theme/icons/main-menu-videos-icon.svg";
import { ButtonGroup, ButtonGroupButton } from "../ButtonGroup/ButtonGroup";
import { Column } from "../Column/Column";
import { MockText } from "../MockText/MockText";
import { P } from "../Paragraph/Paragraph";
import { View } from "../View/View";
import { MainMenu, MainMenuItem } from "./MainMenu";

export default {
  title: "MainMenu",
  component: MainMenu,
};

export const ExampleMenu: React.FC = () => {
  const [activeItemIndex, setActiveItemIndex] = useState(0);

  useDisableScrolling();

  return (
    <View>
      <ButtonGroup>
        <ButtonGroupButton
          quaternary={activeItemIndex > 0}
          onClick={() => setActiveItemIndex(Math.max(activeItemIndex - 1, 0))}
        >
          Focus previous menu
        </ButtonGroupButton>
        <ButtonGroupButton
          quaternary={activeItemIndex < 3}
          onClick={() => setActiveItemIndex(Math.min(activeItemIndex + 1, 3))}
        >
          Focus next menu
        </ButtonGroupButton>
      </ButtonGroup>
      <Column expanded padded scrollable>
        <P>Active menu item index: {activeItemIndex}</P>
        <MockText />
      </Column>
      <MainMenu activeItemIndex={activeItemIndex} onItemClick={setActiveItemIndex}>
        <MainMenuItem icon={<ProfileIcon />}>Profile</MainMenuItem>
        <MainMenuItem icon={<JourneysIcon />}>My Journeys</MainMenuItem>
        <MainMenuItem icon={<PregnancyIcon />}>My Pregnancy</MainMenuItem>
        <MainMenuItem icon={<VideosIcon />}>Videos</MainMenuItem>
      </MainMenu>
    </View>
  );
};
