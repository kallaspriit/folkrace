import * as React from "react";
import { Subscribe, Container } from "unstated";

interface CounterState {
  count: number;
}

class CounterContainer extends Container<CounterState> {
  public state = {
    count: 0,
  };

  public increment() {
    this.setState({ count: this.state.count + 1 });
  }

  public decrement() {
    this.setState({ count: this.state.count - 1 });
  }
}

const BotView: React.StatelessComponent<{}> = () => (
  <Subscribe to={[CounterContainer]}>
    {(counter: CounterContainer) => (
      <div className="view view--text bot-view">
        <button onClick={() => counter.decrement()}>-</button>
        <span>{counter.state.count}</span>
        <button onClick={() => counter.increment()}>+</button>
      </div>
    )}
  </Subscribe>
);

export default BotView;
