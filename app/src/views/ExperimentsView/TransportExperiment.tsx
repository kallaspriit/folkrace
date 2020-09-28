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
import { TransportStatus, TransportListener } from "../../lib/transport";
import { MainMenuViewParams, MAIN_MENU_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { robot } from "../../services/robot";
import { logMessagesState } from "../../state/logMessagesState";

export const TransportExperiment: React.FC = () => {
  const history = useHistory();
  const [connectionState, setConnectionState] = useState(TransportStatus.DISCONNECTED);
  const logMessages = useRecoilValue(logMessagesState);
  const renderCount = useRenderCount("TransportExperiment");
  const log = useLog();

  // transport listener, just logs everything
  const transportListener = useMemo<TransportListener>(
    () => ({
      onStatusChanged: (transport, newState, _previousState) => {
        setConnectionState(newState);

        log.info(`${transport.getName()} state changed to ${newState}`);
      },
      onError: (_transport, error) => {
        log.error(`transport error occurred${error ? ` (${error.message})` : ""}`);
      },
      onMessageSent: (transport, message, wasSentSuccessfully: boolean) => {
        if (wasSentSuccessfully) {
          log.send(`${message}${!wasSentSuccessfully ? " [SENDING FAILED]" : ""}`, transport.getName());
        } else {
          log.error(`sending message "${message}" failed`, transport.getName());
        }
      },
      onMessageReceived: (transport, message) => {
        log.receive(message, transport.getName());
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
        title="Transport experiment"
        onBack={() =>
          history.replace(
            buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, { menu: "settings", page: "experiments" }),
          )
        }
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
          {logMessages.map(({ type, message }, index) => (
            <P small key={index}>
              [{type}] {message}
            </P>
          ))}
        </Column>
      </Column>
      <ButtonGroup equalWidth>
        <ButtonGroupButton tertiary onClick={() => robot.ping()}>
          Ping
        </ButtonGroupButton>
        <ButtonGroupButton
          tertiary
          onClick={() =>
            robot.setMotorTargetRpms({
              left: 60,
              right: 60,
            })
          }
        >
          Start motors
        </ButtonGroupButton>
        <ButtonGroupButton tertiary onClick={() => robot.stop()}>
          Stop motors
        </ButtonGroupButton>
      </ButtonGroup>
    </View>
  );
};
