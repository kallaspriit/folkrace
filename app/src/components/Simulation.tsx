import React from "react";
import styled from "styled-components";

import { Simulator } from "../lib/simulator";

export class Simulation extends React.Component {
  private readonly containerRef = React.createRef<HTMLDivElement>();
  private simulator: Simulator | null = null;

  componentDidMount() {
    // setup is delayed to allow for it to get correct size
    setImmediate(() => this.setup());
  }

  componentWillUnmount() {
    if (this.simulator !== null) {
      this.simulator.stop();
      this.simulator = null;
    }
  }

  render() {
    return <Map ref={this.containerRef} />;
  }

  private setup() {
    const container = this.containerRef.current;

    if (!container) {
      throw new Error("Wrap element was not found, this should not happen");
    }

    this.simulator = new Simulator({
      container,
      radius: 5,
      cellSize: 0.1,
      pathPlanningIntervalMs: 100,
    });

    this.simulator.start();
  }
}

const Map = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
`;
