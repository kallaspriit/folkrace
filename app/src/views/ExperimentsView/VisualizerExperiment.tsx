import React, { useRef, useCallback } from "react";
import { useHistory } from "react-router-dom";
import { Flex } from "../../components/Flex/Flex";
import { FlexElement } from "../../components/Flex/Flex";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { useVisualizer } from "../../hooks/useVisualizer";
import { Visualizer, LayerOptions, FrameInfo } from "../../lib/visualizer";
import { MainMenuViewParams, MAIN_MENU_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";

export const VisualizerExperiment: React.FC = () => {
  const history = useHistory();
  const visualizerContainerRef = useRef<FlexElement>(null);

  const setupVisualizer = useCallback((visualizer: Visualizer) => {
    const options = {
      radius: 4,
      cellSize: 0.1,
    };

    const mapLayerOptions: LayerOptions = {
      getTransform: (layer) => {
        const screenOrigin = {
          x: layer.width / 2,
          y: layer.height / 2,
        };
        const rotation = -Math.PI / 2;
        const scale = layer.size / 2 / (options.radius + options.cellSize);

        return {
          horizontalScaling: -1,
          verticalSkewing: 0,
          horizontalSkewing: 0,
          verticalScaling: 1,
          horizontalTranslation: screenOrigin.x,
          verticalTranslation: screenOrigin.y,
          rotation,
          scale,
        };
      },
    };

    const renderBackground = ({ layer, frame }: FrameInfo) => {
      // only draw the first frame
      if (frame > 0) {
        return;
      }

      const gridSize = (options.radius * 2) / options.cellSize;
      const circleStep = options.radius / 4;

      // draw full size background grid
      layer.drawGrid(
        {
          cellWidth: options.cellSize,
          cellHeight: options.cellSize,
          columns: 2 * Math.ceil(layer.height / layer.getScale() / options.cellSize / 2),
          rows: 2 * Math.ceil(layer.width / layer.getScale() / options.cellSize / 2),
          centered: true,
        },
        { strokeStyle: "#222" },
      );

      // draw map sized active grid
      layer.drawGrid(
        {
          rows: gridSize,
          columns: gridSize,
          cellWidth: options.cellSize,
          cellHeight: options.cellSize,
          centered: true,
        },
        { strokeStyle: "#333" },
      );

      // draw radius circles
      for (let circleRadius = circleStep; circleRadius <= options.radius; circleRadius += circleStep) {
        layer.drawCircle({ radius: circleRadius }, { strokeStyle: "#444" });
        layer.drawText(
          {
            origin: { x: 0, y: circleRadius },
            text: `${circleRadius.toFixed(2)}m`,
            offset: { x: 10, y: 0 },
          },
          { fillStyle: "#444", textBaseline: "middle" },
        );
      }

      // draw coordinates system
      layer.drawCoordinateSystem();
    };

    visualizer.createLayer({
      ...mapLayerOptions,
      render: renderBackground,
    });
  }, []);

  useVisualizer(visualizerContainerRef, setupVisualizer);

  return (
    <View>
      <TitleBar
        title="Visualizer experiment"
        onBack={() =>
          history.replace(
            buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, { menu: "settings", page: "experiments" }),
          )
        }
      />
      <Flex expanded ref={visualizerContainerRef} />
    </View>
  );
};
