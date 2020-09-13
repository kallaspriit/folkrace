import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { ButtonGroup, ButtonGroupButton } from "../../components/ButtonGroup/ButtonGroup";
import { Column } from "../../components/Column/Column";
import { ListItem, List } from "../../components/List/List";
import { P } from "../../components/Paragraph/Paragraph";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { useTransportListener } from "../../hooks/useTransportListener";
import { TransportState } from "../../lib/transport";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { robot } from "../../services/robot";

export const TransportExperiment: React.FC = () => {
  const history = useHistory();
  const [connectionState, setConnectionState] = useState(TransportState.DISCONNECTED);
  const [connectionError, setConnectionError] = useState<string>();
  const [logMessages, setLogMessages] = useState<string[]>([]);

  const log = (message: string) => {
    setLogMessages([...logMessages, message]);
  };

  useTransportListener({
    onStateChanged: (transport, newState, _previousState) => {
      setConnectionState(newState);

      log(`# ${transport.getName()} state changed to ${newState}`);

      // void status.setTransportState(newState);
    },
    onError: (_transport, error) => {
      log(`@ transport error occurred${error ? ` (${error.message})` : ""}`);

      setConnectionError(error?.message);
    },
    onMessageSent: (transport, message, wasSentSuccessfully: boolean) => {
      const [command] = message.split(":");
      const noLogCommands: string[] = [];

      // don't blacklisted messages
      if (!noLogCommands.includes(command)) {
        log(`[${transport.getName()}] > ${message}${!wasSentSuccessfully ? " (sending failed)" : ""}`);
      }
    },
    onMessageReceived: (transport, message) => {
      const [command] = message.split(":");
      const noLogCommands = ["e", "b", "l"];

      // don't blacklisted messages
      if (!noLogCommands.includes(command)) {
        log(`[${transport.getName()}] < ${message}`);
      }
    },
  });

  return (
    <View>
      <TitleBar
        onBack={() => history.replace(buildUrl<ExperimentsViewParams>(EXPERIMENTS_VIEW_PATH))}
        title="Transport experiment"
      />
      <Column expanded scrollable>
        <List>
          <ListItem compact trailing={connectionState}>
            Connection state
          </ListItem>
          <ListItem compact trailing={connectionError ?? "n/a"}>
            Connection error
          </ListItem>
        </List>
        <Column expanded padded compact autoscroll>
          {logMessages.map((message, index) => (
            <P small key={index}>
              {message}
            </P>
          ))}
        </Column>
      </Column>
      <ButtonGroup equalWidth>
        <ButtonGroupButton secondary onClick={() => robot.ping()}>
          Ping
        </ButtonGroupButton>
        <ButtonGroupButton secondary onClick={() => robot.setSpeed(1000, 1000)}>
          Start motors
        </ButtonGroupButton>
        <ButtonGroupButton secondary onClick={() => robot.setSpeed(0, 0)}>
          Stop motors
        </ButtonGroupButton>
      </ButtonGroup>
    </View>
  );
};
