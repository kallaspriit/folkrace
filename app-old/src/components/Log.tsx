import React from "react";
import styled from "styled-components";
import { Subscribe } from "unstated";

import { LogContainer, MessageType } from "../containers/LogContainer";
import { formatTime } from "../services/formatTime";
import { Clickable } from "../theme";

import { AutoScroll } from "./AutoScroll";
import { Cell } from "./Grid";
import { ClearIcon } from "./Icon";

const StatusGridItem = styled(Cell)`
  grid-column: 1 / 4;
  font-family: Consolas, "Courier New", Courier, monospace;
  display: flex;
  overflow: hidden;
`;

const LogWrap = styled(AutoScroll)`
  flex: 1;
  overflow: scroll;
  padding: 8px;
`;

const LogEntry = styled.div``;

const LogEntryTime = styled.span`
  color: ${(props) => props.theme.text.secondary};
`;

interface LogEntryMessageProps {
  type: MessageType;
}

const logEntryTypeColorMap = {
  [MessageType.INFO]: "#666",
  [MessageType.RX]: "#090",
  [MessageType.TX]: "#FF8000",
  [MessageType.ERROR]: "#900",
};

const LogEntryMessage = styled.span<LogEntryMessageProps>`
  padding-left: 6px;
  border-left: 2px solid ${(props) => logEntryTypeColorMap[props.type]};
  margin-left: 6px;
`;

const LogEntryCount = styled.span`
  display: inline-block;
  padding: 0 4px;
  margin-left: 8px;
  border-radius: 8px;
  background-color: ${(props) => props.theme.text.primary};
  color: ${(props) => props.theme.bg.tertiary};
`;

const ClearLogButton = styled.div<Clickable>`
  box-sizing: content-box;
  position: absolute;
  bottom: ${(props) => props.theme.size.gridGap};
  right: ${(props) => props.theme.size.gridGap};
  width: 32px;
  height: 32px;
  padding: 10px;
  background-color: ${(props) => props.theme.bg.tertiary};
`;

const ClearLogIcon = styled(ClearIcon)`
  background-color: ${(props) => props.theme.text.secondary};
`;

export const Log: React.SFC = () => (
  <Subscribe to={[LogContainer]}>
    {(log: LogContainer) => (
      <StatusGridItem>
        <LogWrap>
          {log.state.entries.map((entry) => (
            <LogEntry key={entry.id}>
              <LogEntryTime>{formatTime(entry.time)}</LogEntryTime>
              <LogEntryMessage type={entry.type}>
                {entry.message}
              </LogEntryMessage>
              {entry.count > 1 ? (
                <LogEntryCount>{entry.count}</LogEntryCount>
              ) : null}
            </LogEntry>
          ))}
        </LogWrap>
        <ClearLogButton onClick={() => log.clear()}>
          <ClearLogIcon />
        </ClearLogButton>
      </StatusGridItem>
    )}
  </Subscribe>
);
