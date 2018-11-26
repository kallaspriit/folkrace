import * as React from "react";
import { Subscribe } from "unstated";
import LogContainer from "../../../containers/LogContainer";
import { GridItem } from "../../../components/grid/Grid";
import formatTime from "../../../services/formatTime";
import Icon from "../../../components/icon/Icon";
import AutoScroll from "../../../components/auto-scroll/AutoScroll";

const Log: React.SFC = () => (
  <Subscribe to={[LogContainer]}>
    {(logContainer: LogContainer) => (
      <GridItem className="log">
        <AutoScroll className="log__wrap">
          {logContainer.state.entries.map(entry => (
            <div className="log__entry" key={entry.id}>
              <span className="log__entry__time">{formatTime(entry.time)}</span>{" "}
              <span
                className={`log__entry__message log__entry__message--${entry.type.toLowerCase()}`}
              >
                {entry.message}
              </span>
              {entry.count > 1 ? (
                <span className="log__entry__count">{entry.count}</span>
              ) : null}
            </div>
          ))}
        </AutoScroll>
        <div className="clear-log-button" onClick={() => logContainer.clear()}>
          <Icon name="clear" />
        </div>
      </GridItem>
    )}
  </Subscribe>
);

export default Log;
