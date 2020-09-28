import { Layer, LayerOptions } from "./Layer";

export interface ContainerSize {
  width: number;
  height: number;
}

export class Visualizer {
  readonly layers: Layer[] = [];

  constructor(readonly container: HTMLElement) {}

  createLayer(options: LayerOptions) {
    const containerSize: ContainerSize = {
      width: this.container.clientWidth,
      height: this.container.clientHeight,
    };

    // create canvas and add it to DOM
    const canvas = this.createCanvasElement(containerSize);

    console.log({
      containerSize,
    });

    this.container.append(canvas);

    // create layer and register it
    const layer = new Layer(canvas, options);

    this.layers.push(layer);

    return layer;
  }

  start() {
    // start rendering all layers
    for (const layer of this.layers) {
      layer.start();
    }
  }

  stop() {
    // stop rendering all layers
    for (const layer of this.layers) {
      layer.stop();
    }
  }

  private createCanvasElement({ width, height }: ContainerSize) {
    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    return canvas;
  }
}
