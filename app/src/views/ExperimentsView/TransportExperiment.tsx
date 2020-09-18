import React, { useState, useMemo } from "react";
import { useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { ButtonGroup, ButtonGroupButton } from "../../components/ButtonGroup/ButtonGroup";
import { Column } from "../../components/Column/Column";
import { ListItem, List } from "../../components/List/List";
import { P } from "../../components/Paragraph/Paragraph";
import { useRenderCount } from "../../components/RenderCount/RenderCount";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { useLog } from "../../hooks/useLog";
import { useTransportListener } from "../../hooks/useTransportListener";
import { TransportState, TransportListener } from "../../lib/transport";
import { ExperimentsViewParams, EXPERIMENTS_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { robot } from "../../services/robot";
import { LogMessageType, logMessagesState } from "../../state/logMessagesState";

export const TransportExperiment: React.FC = () => {
  const history = useHistory();
  const [connectionState, setConnectionState] = useState(TransportState.DISCONNECTED);
  const logMessages = useRecoilValue(logMessagesState);
  const renderCount = useRenderCount("TransportExperiment");
  const log = useLog();

  // transport listener, just logs everything
  const transportListener = useMemo<TransportListener>(
    () => ({
      onStateChanged: (transport, newState, _previousState) => {
        setConnectionState(newState);

        log(LogMessageType.INFO, `# ${transport.getName()} state changed to ${newState}`);
      },
      onError: (_transport, error) => {
        log(LogMessageType.ERROR, `@ transport error occurred${error ? ` (${error.message})` : ""}`);
      },
      onMessageSent: (transport, message, wasSentSuccessfully: boolean) => {
        if (wasSentSuccessfully) {
          log(LogMessageType.SEND, `${message}${!wasSentSuccessfully ? " [SENDING FAILED]" : ""}`, transport.getName());
        } else {
          log(LogMessageType.ERROR, `Sending message "${message}" failed`, transport.getName());
        }
      },
      onMessageReceived: (transport, message) => {
        log(LogMessageType.RECEIVE, message, transport.getName());
      },
    }),
    // we don't want to create new listener when log changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useTransportListener(transportListener);

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
          <ListItem compact trailing={renderCount}>
            Render count
          </ListItem>
        </List>
        <Column expanded padded compact autoscroll>
          {logMessages.map(({ type, message, transportName }, index) => (
            <P small key={index}>
              [{type}] {transportName && `[${transportName}] `}
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
