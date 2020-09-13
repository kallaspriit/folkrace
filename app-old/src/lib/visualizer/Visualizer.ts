import { Layer, LayerOptions } from "./Layer";

export class Visualizer {
  readonly layers: Layer[] = [];

  constructor(readonly container: HTMLElement) {}

  createLayer(options: LayerOptions) {
    // create canvas and add it to DOM
    const canvas = this.createCanvasElement();
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

  private createCanvasElement() {
    const canvas = document.createElement("canvas");

    canvas.style.position = "absolute";
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.left = "0";
    canvas.style.right = "0";

    return canvas;
  }
}
