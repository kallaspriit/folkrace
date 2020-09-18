import classNames from "classnames";
import React from "react";
import { Column } from "../Column/Column";
import { Container } from "../Container/Container";
import { P } from "../Paragraph/Paragraph";
import styles from "./Status.module.scss";

export type StateStatus = "good" | "warn" | "error";

export interface StatusProps {
  title: string;
  description: string;
  status: StateStatus;
  icon: React.ReactNode;
}

export const Status: React.FC<StatusProps> = ({ title, description, status, icon }) => (
  <Column
    center
    padded
    compact
    className={classNames(styles.status, {
      [styles["status--good"]]: status === "good",
      [styles["status--warn"]]: status === "warn",
      [styles["status--error"]]: status === "error",
    })}
  >
    <Container className={styles["icon-wrap"]}>{icon}</Container>
    <P compact>{title}</P>
    <P compact small>
      {description}
    </P>
  </Column>
);
