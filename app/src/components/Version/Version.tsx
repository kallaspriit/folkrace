import React from "react";
import { config } from "../../config";
import { Container } from "../Container/Container";
import styles from "./Version.module.scss";

export const Version: React.FC = () => {
  return (
    <Container className={styles.version}>
      {config.clientVersion}
      {/* {config.clientVersion} - {windowSize.width}x{windowSize.height} */}
    </Container>
  );
};
