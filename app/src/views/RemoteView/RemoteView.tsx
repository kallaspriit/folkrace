import React, { useRef, useEffect } from "react";
import { FlexElement, Flex } from "../../components/Flex/Flex";
import { config } from "../../config";
import { GamepadManager } from "../../lib/gamepad";
import { RemoteController } from "../../lib/remote-controller";
import { robot } from "../../services/robot";

export const RemoteView: React.FC = () => {
  const viewRef = useRef<FlexElement>(null);

  useEffect(() => {
    const remoteController = new RemoteController({
      robot,
      vehicleOptions: config.vehicle,
      log: console,
    });

    const gamepadManager = new GamepadManager({
      defaultDeadzone: 0.1,
      log: console,
      onUpdate: (gamepad) => {
        // console.log("GAMEPAD UPDATED", gamepad.index, gamepad.axes, gamepad.buttons);
        // gamepad.axes.forEach((axisValue, axisIndex) => {
        //   const name = `Gamepad #${gamepad.index}.${axisIndex}`;

        //   if (!this.statistics.getByName(name)) {
        //     this.statistics.create({
        //       name,
        //       min: -1,
        //       max: 1,
        //       decimalPlaces: 2,
        //     });
        //   }

        //   this.statistics.report(name, axisValue);
        // });

        const speedInput = gamepad.axes[3];
        const omegaInput = gamepad.axes[0];

        const speed = speedInput * -1;
        const omega = omegaInput;

        remoteController.setSpeed(speed);
        remoteController.setOmega(omega);
      },
    });

    // release gamepads when the view is destroyed
    return () => gamepadManager.destroy();
  }, []);

  return (
    <Flex cover center ref={viewRef}>
      Remote view
    </Flex>
  );
};
