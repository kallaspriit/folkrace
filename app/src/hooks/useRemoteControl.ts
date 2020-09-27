import { useState, useEffect } from "react";
import { config } from "../config";
import { GamepadManager } from "../lib/gamepad";
import { RemoteController } from "../lib/remote-controller";
import { calculateControllerRate } from "../services/calculateControllerRate";
import { robot } from "../services/robot";
import { useLog } from "./useLog";

export function useRemoteControl(isEnabled = true) {
  const [gamepadName, setGamepadName] = useState<string>();
  const log = useLog();

  useEffect(() => {
    const remoteController = new RemoteController({
      robot,
      vehicleOptions: config.vehicle,
      log,
    });

    const gamepadManager = new GamepadManager({
      log,
      onConnect: (gamepad) => {
        setGamepadName(gamepad.id);

        console.log("gamepad connected", gamepad.id);
      },
      onDisconnect: () => {
        const remainingGamepad = gamepadManager.getFirstAvailableGamepad();

        robot.stop();

        setGamepadName(remainingGamepad?.id);
      },
      onUpdate: (gamepad, haveButtonsChanged) => {
        // ignore if not enabled
        if (!isEnabled) {
          return;
        }

        // use rate inputs to have better control around center axes
        const speed = calculateControllerRate(gamepad.axes[3] * -1, config.rates);
        const omega = calculateControllerRate(gamepad.axes[0], config.rates);

        if (haveButtonsChanged) {
          const pressedButtonIndexes = gamepad.buttons
            .filter((button) => button.pressed)
            .map((pressedButton) => gamepad.buttons.indexOf(pressedButton));

          log.info(`pressed: ${pressedButtonIndexes.length > 0 ? pressedButtonIndexes.join(", ") : "none"}`);

          const isPressedX = gamepad.buttons[0].pressed;

          // run fixed rpm experiment when X is pressed
          if (isPressedX) {
            robot.setMotorsTargetRpm(60, 60);

            return;
          } else {
            robot.stop();
          }
        }

        // speed is in m/s, omega is in rad/s
        remoteController.setSpeed(speed);
        remoteController.setOmega(omega);
      },
    });

    // release gamepads and stop robot when the view is destroyed
    return () => {
      gamepadManager.destroy();
      robot.stop();
    };
  }, [isEnabled, log]);

  return {
    gamepadName,
  };
}
