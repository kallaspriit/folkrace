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
import { odometryPositionState, OdometryPosition, initialOdometryPosition } from "../../state/odometryPositionState";
import { odometryStepsState, OdometryStep, initialOdometryStep } from "../../state/odometryStepsState";

// TODO: think of a proper way to update canvas state
let _odometryPosition: OdometryPosition = initialOdometryPosition;
let _odometrySteps: OdometryStep[] = [initialOdometryStep];

export const RemoteView: React.FC = () => {
  const history = useHistory();
  const visualizerContainerRef = useRef<FlexElement>(null);
  const { gamepadName } = useRemoteControl();
  const odometryPosition = useRecoilValue(odometryPositionState);
  const odometrySteps = useRecoilValue(odometryStepsState);
  const resetOdometry = useResetRecoilState(odometryStepsState);

  // TODO: think of a proper way to update canvas state
  useEffect(() => {
    _odometryPosition = odometryPosition;
  }, [odometryPosition]);
  useEffect(() => {
    _odometrySteps = odometrySteps;
  }, [odometrySteps]);

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

      // draw odometry steps
      _odometrySteps.forEach((odometryStep, index) => {
        const previousStep = index > 0 ? _odometrySteps[index - 1] : undefined;

        if (!previousStep) {
          return;
        }

        layer.drawLine(
          {
            from: previousStep.position,
            to: odometryStep.position,
          },
          {
            strokeStyle: `rgba(0, 200, 0, ${index / _odometrySteps.length})`,
            lineWidth: 5,
            // lineCap: "round",
          },
        );
      });

      // draw robot
      drawRobot({
        center: _odometryPosition.position,
        angle: _odometryPosition.angle,
        layer,
      });

      // draw robot info
      layer.drawText(
        {
          origin: _odometryPosition.position,
          text: `X: ${_odometryPosition.position.x.toFixed(2)}`,
          offset: { x: 20, y: 0 },
        },
        { fillStyle: "#FFF", textBaseline: "middle" },
      );
      layer.drawText(
        {
          origin: _odometryPosition.position,
          text: `Y: ${_odometryPosition.position.y.toFixed(2)}`,
          offset: { x: 20, y: 20 },
        },
        { fillStyle: "#FFF", textBaseline: "middle" },
      );
      layer.drawText(
        {
          origin: _odometryPosition.position,
          text: `Angle: ${radiansToDegrees(_odometryPosition.angle).toFixed(1)}°`,
          offset: { x: 20, y: 40 },
        },
        { fillStyle: "#FFF", textBaseline: "middle" },
      );
      layer.drawText(
        {
          origin: _odometryPosition.position,
          text: `Speed: ${_odometryPosition.velocity.y.toFixed(1)} m/s`,
          offset: { x: 20, y: 60 },
        },
        { fillStyle: "#FFF", textBaseline: "middle" },
      );
    };

    // map layer is rendered once with grid etc
    visualizer.createLayer({
      ...mapLayerOptions,
      render: renderBackground,
    });

    // odometry layer is rendered for every frame with odometry details
    visualizer.createLayer({
      ...mapLayerOptions,
      render: renderOdometry,
    });
  }, []);

  // setup visualizer
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
