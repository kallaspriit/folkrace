import { useState, useEffect } from "react";
import { config } from "../config";
import { GamepadManager } from "../lib/gamepad";
import { RemoteController } from "../lib/remote-controller";
import { calculateControllerRate } from "../services/calculateControllerRate";
import { robot } from "../services/robot";

export function useRemoteControl() {
  const [gamepadName, setGamepadName] = useState<string>();

  useEffect(() => {
    const remoteController = new RemoteController({
      robot,
      vehicleOptions: config.vehicle,
      log: console,
    });

    const gamepadManager = new GamepadManager({
      log: console,
      onConnect: (gamepad) => {
        setGamepadName(gamepad.id);

        console.log("gamepad connected", gamepad.id);
      },
      onDisconnect: () => {
        const remainingGamepad = gamepadManager.getFirstAvailableGamepad();

        robot.stop();

        setGamepadName(remainingGamepad?.id);
      },
      onUpdate: (gamepad) => {
        // use rate inputs to have better control around center axes
        const speed = calculateControllerRate(gamepad.axes[3] * -1, config.rates);
        const omega = calculateControllerRate(gamepad.axes[0], config.rates);

        remoteController.setSpeed(speed);
        remoteController.setOmega(omega);
      },
    });

    // release gamepads and stop robot when the view is destroyed
    return () => {
      gamepadManager.destroy();
      robot.stop();
    };
  }, []);

  return {
    gamepadName,
  };
}
