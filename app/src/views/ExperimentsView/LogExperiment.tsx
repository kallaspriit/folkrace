import React from "react";
import { useHistory } from "react-router-dom";
import { useRecoilState } from "recoil";
import { ButtonGroup, ButtonGroupButton } from "../../components/ButtonGroup/ButtonGroup";
import { Column } from "../../components/Column/Column";
import { List, ListItem } from "../../components/List/List";
import { P } from "../../components/Paragraph/Paragraph";
import { useRenderCount } from "../../components/RenderCount/RenderCount";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { MainMenuViewParams, MAIN_MENU_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { robot } from "../../services/robot";
import { logMessagesState } from "../../state/logMessagesState";

export const LogExperiment: React.FC = () => {
  const history = useHistory();
  const [logMessages, setLogMessages] = useRecoilState(logMessagesState);
  const renderCount = useRenderCount("LogExperiment");

  return (
    <View>
      <TitleBar
        title="Log experiment"
        onBack={() =>
          history.replace(
            buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, { menu: "settings", page: "experiments" }),
          )
        }
      />
      <List>
        <ListItem compact trailing={renderCount}>
          Render count
        </ListItem>
      </List>
      <Column expanded scrollable padded compact autoscroll>
        {logMessages.map(({ type, message, transportName }, index) => (
          <P small key={index}>
            [{type}] {transportName && `[${transportName}] `}
            {message}
          </P>
        ))}
      </Column>
      <ButtonGroup equalWidth>
        <ButtonGroupButton tertiary onClick={() => setLogMessages([])}>
          Clear log
        </ButtonGroupButton>
        <ButtonGroupButton tertiary onClick={() => robot.requestState()}>
          Request state
        </ButtonGroupButton>
      </ButtonGroup>
    </View>
  );
};
