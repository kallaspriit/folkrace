import React, { useRef, useCallback, useEffect } from "react";
import { useHistory } from "react-router";
import { useRecoilValue, useResetRecoilState } from "recoil";
import { BlockButton } from "../../components/BlockButton/BlockButton";
import { Column } from "../../components/Column/Column";
import { Expanded } from "../../components/Expanded/Expanded";
import { Flex, FlexElement } from "../../components/Flex/Flex";
import { NameValuePair } from "../../components/NameValuePair/NameValuePair";
import { Stack } from "../../components/Stack/Stack";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { useRemoteControl } from "../../hooks/useRemoteControl";
import { useVisualizer } from "../../hooks/useVisualizer";
import { Visualizer, LayerOptions, RenderLayerFn } from "../../lib/visualizer";
import { drawRobot } from "../../services/drawRobot";
import { Point2D, getEuclideanDistance } from "../../services/getEuclideanDistance";
import { radiansToDegrees } from "../../services/radiansToDegrees";
import { odometryState, OdometryStep } from "../../state/odometryState";

let odometrySteps: OdometryStep[] = [];

export const RemoteView: React.FC = () => {
  const history = useHistory();
  const visualizerContainerRef = useRef<FlexElement>(null);
  const { gamepadName } = useRemoteControl();
  const odometry = useRecoilValue(odometryState);
  const resetOdometry = useResetRecoilState(odometryState);

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
        // const rotation = -Math.PI / 2;
        const rotation = Math.PI;
        // const rotation = 0;
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

      layer.drawGrid(
        {
          cellWidth: options.cellSize * 5,
          cellHeight: options.cellSize * 5,
          columns: 2 * Math.ceil(layer.height / layer.getScale() / options.cellSize / 5 / 2),
          rows: 2 * Math.ceil(layer.width / layer.getScale() / options.cellSize / 5 / 2),
          centered: true,
        },
        { strokeStyle: "#444" },
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
            origin: { x: -circleRadius, y: 0 },
            text: `${circleRadius.toFixed(0)}m`,
            offset: { x: 10, y: 0 },
          },
          { fillStyle: "#444", textBaseline: "middle" },
        );
      }

      // draw coordinates system
      layer.drawCoordinateSystem({
        center: {
          x: options.radius - 0.5,
          y: options.radius - 0.5,
        },
      });

      // red test box at 0,1
      // layer.drawBox(
      //   {
      //     origin: {
      //       x: 0,
      //       y: 1,
      //     },
      //     width: 0.1,
      //     height: 0.1,
      //     centered: true,
      //   },
      //   {
      //     fillStyle: "#F00",
      //   },
      // );

      // green test box at 0,1
      // layer.drawBox(
      //   {
      //     origin: {
      //       x: 1,
      //       y: 0,
      //     },
      //     width: 0.1,
      //     height: 0.1,
      //     centered: true,
      //   },
      //   {
      //     fillStyle: "#0F0",
      //   },
      // );
    };

    const renderOdometry: RenderLayerFn = ({ layer }) => {
      layer.clear();

      let previousRenderedLinePosition: Point2D | undefined = undefined;

      odometrySteps.forEach((odometryStep, index) => {
        const isLastStep = index === odometrySteps.length - 1;
        const previousStep = index > 0 ? odometrySteps[index - 1] : undefined;

        if (isLastStep) {
          // draw last line
          if (previousRenderedLinePosition) {
            layer.drawLine(
              {
                from: previousRenderedLinePosition,
                to: odometryStep.position,
              },
              {
                strokeStyle: `rgba(0, 200, 0, ${index / odometrySteps.length})`,
                lineWidth: 5,
              },
            );
          }

          // draw robot
          drawRobot({
            center: odometryStep.position,
            angle: odometryStep.angle,
            layer,
          });

          // draw robot info
          layer.drawText(
            {
              origin: odometryStep.position,
              text: `X: ${odometryStep.position.x.toFixed(2)}`,
              offset: { x: 20, y: 0 },
            },
            { fillStyle: "#FFF", textBaseline: "middle" },
          );
          layer.drawText(
            {
              origin: odometryStep.position,
              text: `Y: ${odometryStep.position.y.toFixed(2)}`,
              offset: { x: 20, y: 20 },
            },
            { fillStyle: "#FFF", textBaseline: "middle" },
          );
          layer.drawText(
            {
              origin: odometryStep.position,
              text: `Angle: ${radiansToDegrees(odometryStep.angle).toFixed(1)}°`,
              offset: { x: 20, y: 40 },
            },
            { fillStyle: "#FFF", textBaseline: "middle" },
          );
          layer.drawText(
            {
              origin: odometryStep.position,
              text: `Speed: ${odometryStep.motion.velocity.y.toFixed(1)} m/s`,
              offset: { x: 20, y: 60 },
            },
            { fillStyle: "#FFF", textBaseline: "middle" },
          );
        } else if (previousStep !== undefined) {
          // layer.drawBox(
          //   {
          //     origin: odometryStep.position,
          //     width: 0.05,
          //     height: 0.05,
          //     centered: true,
          //   },
          //   {
          //     fillStyle: "#0F0",
          //   },
          // );

          const distance =
            previousRenderedLinePosition !== undefined
              ? getEuclideanDistance(odometryStep.position, previousRenderedLinePosition)
              : Number.POSITIVE_INFINITY;

          // TODO: instead only add points if sufficiently far away from last?
          // TODO: instead of individual lines, draw one long path? could use gradient?
          if (distance >= 0.05 || isLastStep) {
            layer.drawLine(
              {
                from: previousRenderedLinePosition ? previousRenderedLinePosition : previousStep.position,
                to: odometryStep.position,
              },
              {
                strokeStyle: `rgba(0, 200, 0, ${index / odometrySteps.length})`,
                lineWidth: 5,
                // lineCap: "round",
              },
            );

            previousRenderedLinePosition = odometryStep.position;
          }
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

      <Stack expanded>
        <Flex expanded ref={visualizerContainerRef} />
        <Column padded compact>
          <NameValuePair vertical name="Controller">
            {gamepadName ?? "No gamepad available"}
          </NameValuePair>
          <Expanded />
          <BlockButton onClick={() => resetOdometry()}>Reset odometry</BlockButton>
        </Column>
      </Stack>
    </Flex>
  );
};
