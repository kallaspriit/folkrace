import { Coordinates, Layer } from "../lib/visualizer";

export function drawRobot({ center, angle, layer }: { center: Coordinates; angle: number; layer: Layer }) {
  layer.drawObject({
    center,
    angle,
    size: { x: 0.123, y: 0.195 },
    // TODO: draw more detailed robot including tracks, lidar scan line etc
    draw: (ctx, { size }) => {
      const screenSize = layer.worldToScreen(size);
      const arrowScale = 0.5;

      // draw body
      ctx.fillStyle = "#900";
      ctx.fillRect(-screenSize.x / 2, -screenSize.y / 2, screenSize.x, screenSize.y);

      // draw direction arrow
      ctx.fillStyle = "#FFF";
      ctx.beginPath();
      ctx.moveTo((-screenSize.x / 2) * arrowScale, (-screenSize.y / 2) * arrowScale);
      ctx.lineTo(0, (screenSize.y / 2) * arrowScale);
      ctx.lineTo((screenSize.x / 2) * arrowScale, (-screenSize.y / 2) * arrowScale);
      ctx.lineTo((-screenSize.x / 2) * arrowScale, (-screenSize.y / 2) * arrowScale);
      ctx.fill();
    },
  });
}
