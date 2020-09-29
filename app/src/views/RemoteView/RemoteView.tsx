import React, { useRef, useCallback, useEffect } from "react";
import { useHistory } from "react-router";
import { useRecoilValue } from "recoil";
import { Column } from "../../components/Column/Column";
import { Flex, FlexElement } from "../../components/Flex/Flex";
import { NameValuePair } from "../../components/NameValuePair/NameValuePair";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { useRemoteControl } from "../../hooks/useRemoteControl";
import { useVisualizer } from "../../hooks/useVisualizer";
import { Visualizer, LayerOptions, RenderLayerFn } from "../../lib/visualizer";
import { drawRobot } from "../../services/drawRobot";
import { odometryState, OdometryStep } from "../../state/odometryState";

let odometrySteps: OdometryStep[] = [];

export const RemoteView: React.FC = () => {
  const history = useHistory();
  const visualizerContainerRef = useRef<FlexElement>(null);
  const { gamepadName } = useRemoteControl();
  const odometry = useRecoilValue(odometryState);

  // TODO: uncool..
  useEffect(() => {
    odometrySteps = odometry;
  }, [odometry]);

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

    const renderBackground: RenderLayerFn = ({ layer, frame }) => {
      // only draw the first frame
      if (frame > 0) {
        return;
      }

      // const gridSize = (options.radius * 2) / options.cellSize;
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
        { strokeStyle: "#333" },
      );

      // draw map sized active grid
      // layer.drawGrid(
      //   {
      //     rows: gridSize,
      //     columns: gridSize,
      //     cellWidth: options.cellSize,
      //     cellHeight: options.cellSize,
      //     centered: true,
      //   },
      //   { strokeStyle: "#333" },
      // );

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

    const renderOdometry: RenderLayerFn = ({ layer }) => {
      layer.clear();

      odometrySteps.forEach((odometryStep, index) => {
        const isLastStep = index === odometrySteps.length - 1;

        if (isLastStep) {
          drawRobot({
            center: odometryStep.position,
            angle: odometryStep.angle,
            layer,
          });
        } else {
          layer.drawBox(
            {
              origin: odometryStep.position,
              width: 0.05,
              height: 0.05,
              centered: true,
            },
            {
              fillStyle: "#0F0",
            },
          );
        }
      });
    };

    visualizer.createLayer({
      ...mapLayerOptions,
      render: renderBackground,
    });

    visualizer.createLayer({
      ...mapLayerOptions,
      render: renderOdometry,
    });
  }, []);

  useVisualizer(visualizerContainerRef, setupVisualizer);

  return (
    <Flex cover>
      <TitleBar title="Remote controller" onBack={() => history.goBack()} />
      <Column padded compact>
        <NameValuePair vertical name="Controller">
          {gamepadName ?? "No gamepad available"}
        </NameValuePair>
      </Column>
      <Flex expanded ref={visualizerContainerRef} />
    </Flex>
  );
};
