import { useEffect } from "react";
import { Visualizer } from "../lib/visualizer";

export type VisualizerSetupFn = (visualizer: Visualizer) => void;

export function useVisualizer(ref: React.RefObject<HTMLElement>, setup: VisualizerSetupFn) {
  useEffect(() => {
    const element = ref.current;

    if (!element) {
      throw new Error("Visualizer container ref does not contain element, this should not happen");
    }

    const visualizer = new Visualizer(element);

    setup(visualizer);

    visualizer.start();

    return () => {
      visualizer.stop();
    };
  }, [ref, setup]);
}
