import React from "react";
import { useHistory } from "react-router-dom";
import useSound from "use-sound";
import { ButtonGroup, ButtonGroupButton } from "../../components/ButtonGroup/ButtonGroup";
import { Column } from "../../components/Column/Column";
import { List, ListItem } from "../../components/List/List";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";

export const SoundExperiment: React.FC = () => {
  const history = useHistory();
  const [play, { stop, pause, isPlaying, duration }] = useSound("/sounds/low-battery.mp3");

  return (
    <View>
      <TitleBar
        onBack={() => history.replace(buildUrl<ExperimentsViewParams>(EXPERIMENTS_VIEW_PATH))}
        title="Sound experiment"
      />
      <Column expanded scrollable>
        <List>
          <ListItem compact trailing={isPlaying ? "yes" : "no"}>
            Is playing
          </ListItem>
          <ListItem compact trailing={duration ? `${Math.ceil(duration / 1000)}s` : "n/a"}>
            Duration
          </ListItem>
        </List>
      </Column>
      <ButtonGroup equalWidth>
        <ButtonGroupButton secondary onClick={() => play()}>
          Play
        </ButtonGroupButton>
        <ButtonGroupButton secondary onClick={() => pause()}>
          Pause
        </ButtonGroupButton>
        <ButtonGroupButton secondary onClick={() => stop()}>
          Stop
        </ButtonGroupButton>
      </ButtonGroup>
    </View>
  );
};
