import classNames from "classnames";
import React from "react";
import { useRecoilState } from "recoil";
import { logMessagesState, LogMessage, LogMessageType } from "../../state/logMessagesState";
import { ReactComponent as ClearlIcon } from "../../theme/icons/clear-icon.svg";
import { Column } from "../Column/Column";
import { Container } from "../Container/Container";
import { FlexProps } from "../Flex/Flex";
import { Row } from "../Row/Row";
import styles from "./Log.module.scss";

export const Log: React.FC<FlexProps> = ({ className, ...rest }) => {
  const [logMessages, setLogMessages] = useRecoilState(logMessagesState);

  return (
    <Container className={classNames(styles.log, className)} {...rest}>
      <Column expanded scrollable autoscroll>
        {logMessages.map((message, index) => (
          <LogItem key={index} message={message} />
        ))}
      </Column>
      <ClearlIcon className={styles["clear-button"]} onClick={() => setLogMessages([])} />
    </Container>
  );
};

export interface LogItemProps extends FlexProps {
  message: LogMessage;
}

export const LogItem: React.FC<LogItemProps> = ({ message, className, ...rest }) => (
  <Row>
    <Container tiny compact className={styles["message-line"]}>
      {message.index + 1}
    </Container>
    <Container
      tiny
      compact
      expanded
      className={classNames(
        styles["log-item"],
        {
          [styles["log-item--info"]]: message.type === LogMessageType.INFO,
          [styles["log-item--send"]]: message.type === LogMessageType.SEND,
          [styles["log-item--receive"]]: message.type === LogMessageType.RECEIVE,
          [styles["log-item--warn"]]: message.type === LogMessageType.WARN,
          [styles["log-item--error"]]: message.type === LogMessageType.ERROR,
        },
        className,
      )}
      {...rest}
    >
      {getMessageTypeName(message.type)} {message.message}
    </Container>
  </Row>
);

function getMessageTypeName(messageType: LogMessageType) {
  switch (messageType) {
    case LogMessageType.RECEIVE:
      return "<";

    case LogMessageType.SEND:
      return ">";

    case LogMessageType.INFO:
      return "!";

    case LogMessageType.WARN:
      return "#";

    case LogMessageType.ERROR:
      return "@";
  }
}
