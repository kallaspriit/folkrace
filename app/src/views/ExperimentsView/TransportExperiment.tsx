import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { ButtonGroup, ButtonGroupButton } from "../../components/ButtonGroup/ButtonGroup";
import { Column } from "../../components/Column/Column";
import { ListItem, List, ListTitle } from "../../components/List/List";
import { P } from "../../components/Paragraph/Paragraph";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { TransportListener, TransportState } from "../../lib/transport";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { multiTransport } from "../../services/multiTransport";
import { robot } from "../../services/robot";

export const TransportExperiment: React.FC = () => {
  const history = useHistory();
  const [connectionState, setConnectionState] = useState(TransportState.DISCONNECTED);
  const [connectionError, setConnectionError] = useState<string>();
  const [sentMessages, setSentMessages] = useState<string[]>([]);
  const [receivedMessages, setReceivedMessages] = useState<string[]>([]);

  useTransportListener({
    onStateChanged: (transport, newState, _previousState) => {
      console.log(`# ${transport.getName()} state changed to ${newState}`);

      setConnectionState(newState);

      // void status.setTransportState(newState);
    },
    onError: (_transport, error) => {
      console.log(`# transport error occurred${error ? ` (${error.message})` : ""}`);

      setConnectionError(error?.message);
    },
    onMessageSent: (transport, message, wasSentSuccessfully: boolean) => {
      setSentMessages([...sentMessages, `${transport.getName()} > ${message} `]);

      const [command] = message.split(":");
      const noLogCommands = ["ping", "!ping"];

      // don't log single-character recurring commands ("s" for speed etc)
      if (command.length === 1 || noLogCommands.includes(command)) {
        return;
      }

      console.log(`> ${message}${!wasSentSuccessfully ? " (sending failed)" : ""}`);
    },
    onMessageReceived: (transport, message) => {
      setReceivedMessages([...receivedMessages, `[${transport.getName()}] < ${message}`]);

      // console.log("onMessageReceived", message);
      // this.handleTransportMessage(message, containers);
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
          {receivedMessages.map((message, index) => (
            <P small key={index}>
              {message}
            </P>
          ))}
        </Column>
        <Column expanded padded compact autoscroll>
          {sentMessages.map((message, index) => (
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

function useTransportListener(listener: TransportListener) {
  useEffect(() => {
    multiTransport.addListener(listener);

    // attempt to establish connection
    void multiTransport.connect();

    return () => {
      multiTransport.removeListener(listener);
    };
  });
}
