import React from "react";
import styles from "./Debug.module.scss";

export interface DebugProps {
  title?: string;
  omit?: string[];
}

export const Debug: React.FC<DebugProps> = ({ title, omit, children }) => (
  <div className={styles.debug}>
    {title && <div className={styles.title}>{title}</div>}
    <div className={styles.content}>
      {children !== undefined ? JSON.stringify(children, getCircularReplacer(omit), "  ") : <em>undefined</em>}
    </div>
  </div>
);

function getCircularReplacer(omit: string[] = []) {
  const seen = new WeakSet();

  return (key: string, value: unknown) => {
    if (omit.includes(key)) {
      return;
    }

    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return "[circular]";
      }

      seen.add(value);
    }

    if (value === undefined) {
      return "[undefined]";
    }

    return value;
  };
}
