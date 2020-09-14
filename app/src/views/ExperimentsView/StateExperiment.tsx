import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { ButtonGroup, ButtonGroupButton } from "../../components/ButtonGroup/ButtonGroup";
import { Column } from "../../components/Column/Column";
import { List, ListItem } from "../../components/List/List";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { robot } from "../../services/robot";
import { attitudeState } from "../../state/attitudeState";
import { loadState } from "../../state/loadState";
import { loopFrequencyState } from "../../state/loopFrequencyState";
import { voltageState } from "../../state/voltageState";

export const StateExperiment: React.FC = () => {
  const history = useHistory();
  const voltage = useRecoilValue(voltageState);
  const load = useRecoilValue(loadState);
  const loopFrequency = useRecoilValue(loopFrequencyState);
  const attitude = useRecoilValue(attitudeState);

  // request initial state
  useEffect(() => robot.requestState(), []);

  return (
    <View>
      <TitleBar
        onBack={() => history.replace(buildUrl<ExperimentsViewParams>(EXPERIMENTS_VIEW_PATH))}
        title="State experiment"
      />
      <Column expanded scrollable>
        <List>
          <ListItem compact trailing={voltage ? voltage.toFixed(1) : "n/a"}>
            Voltage
          </ListItem>
          <ListItem compact trailing={load ? `${load}%` : "n/a"}>
            Firmware main loop load
          </ListItem>
          <ListItem compact trailing={loopFrequency ? Math.round(loopFrequency) : "n/a"}>
            Firmware main loop update frequency
          </ListItem>
          <ListItem compact trailing={attitude ? `${attitude.roll.toFixed(2)}°` : "n/a"}>
            Attitude roll
          </ListItem>
          <ListItem compact trailing={attitude ? `${attitude.pitch.toFixed(2)}°` : "n/a"}>
            Attitude pitch
          </ListItem>
          <ListItem compact trailing={attitude ? `${attitude.yaw.toFixed(2)}°` : "n/a"}>
            Attitude yaw
          </ListItem>
        </List>
      </Column>
      <ButtonGroup equalWidth>
        <ButtonGroupButton secondary onClick={() => robot.ping()}>
          Ping
        </ButtonGroupButton>
        <ButtonGroupButton secondary onClick={() => robot.requestState()}>
          Request state
        </ButtonGroupButton>
      </ButtonGroup>
    </View>
  );
};
