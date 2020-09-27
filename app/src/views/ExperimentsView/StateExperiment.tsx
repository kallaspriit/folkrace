import React, { useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useRecoilValue } from "recoil";
import { ButtonGroup, ButtonGroupButton } from "../../components/ButtonGroup/ButtonGroup";
import { Column } from "../../components/Column/Column";
import { List, ListItem } from "../../components/List/List";
import { useRenderCount } from "../../components/RenderCount/RenderCount";
import { TitleBar } from "../../components/TitleBar/TitleBar";
import { View } from "../../components/View/View";
import { MainMenuViewParams, MAIN_MENU_VIEW_PATH } from "../../routes";
import { buildUrl } from "../../services/buildUrl";
import { robot } from "../../services/robot";
import { activeTransportNameState } from "../../state/activeTransportNameState";
import { aliveState } from "../../state/aliveState";
import { attitudeState } from "../../state/attitudeState";
import { buttonsState } from "../../state/buttonsState";
import { currentSpeedsState } from "../../state/currentSpeedsState";
import { currentsState } from "../../state/currentsState";
import { encodersState } from "../../state/encodersState";
import { lastHeartbeatTimeState } from "../../state/lastHeartbeatTimeState";
import { lidarMeasurementsState } from "../../state/lidarMeasurementsState";
import { lidarStatusState } from "../../state/lidarStatusState";
import { loadState } from "../../state/loadState";
import { logMessagesState } from "../../state/logMessagesState";
import { loopFrequencyState } from "../../state/loopFrequencyState";
import { motorsConnectedState } from "../../state/motorsConnectedState";
import { serialStatusState } from "../../state/serialStatusState";
import { serverIpState } from "../../state/serverIpState";
import { targetSpeedsState } from "../../state/targetSpeedsState";
import { timerState } from "../../state/timerState";
import { transportStatusState } from "../../state/transportStatusState";
import { usbState } from "../../state/usbState";
import { voltageState } from "../../state/voltageState";

export const StateExperiment: React.FC = () => {
  const history = useHistory();

  const activeTransportName = useRecoilValue(activeTransportNameState);
  const serverIp = useRecoilValue(serverIpState);
  const transportStatus = useRecoilValue(transportStatusState);
  const serialStatus = useRecoilValue(serialStatusState);
  // TODO: generates warning "index.js:1 Warning: Cannot update a component (`Batcher`) while rendering a different component.."
  const isAlive = useRecoilValue(aliveState);
  const areMotorsConnected = useRecoilValue(motorsConnectedState);
  const timer = useRecoilValue(timerState);
  const lastHeartbeatTime = useRecoilValue(lastHeartbeatTimeState);
  const logMessages = useRecoilValue(logMessagesState);
  const voltage = useRecoilValue(voltageState);
  const load = useRecoilValue(loadState);
  const loopFrequency = useRecoilValue(loopFrequencyState);
  const attitude = useRecoilValue(attitudeState);
  const buttons = useRecoilValue(buttonsState);
  const currents = useRecoilValue(currentsState);
  const targetSpeeds = useRecoilValue(targetSpeedsState);
  const currentSpeeds = useRecoilValue(currentSpeedsState);
  const encoders = useRecoilValue(encodersState);
  const lidarStatus = useRecoilValue(lidarStatusState);
  const usb = useRecoilValue(usbState);
  const lidarMeasurements = useRecoilValue(lidarMeasurementsState);
  const renderCount = useRenderCount("StateExperiment");

  // request initial state
  useEffect(() => robot.requestState(), []);

  return (
    <View>
      <TitleBar
        title="State experiment"
        onBack={() =>
          history.replace(
            buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, { menu: "settings", page: "experiments" }),
          )
        }
      />
      <Column expanded scrollable>
        <List>
          <ListItem compact trailing={activeTransportName ?? "n/a"}>
            Active transport name
          </ListItem>
          <ListItem compact trailing={serverIp ?? "n/a"}>
            Server ip
          </ListItem>
          <ListItem compact trailing={transportStatus}>
            Transport status
          </ListItem>
          <ListItem compact trailing={serialStatus}>
            USB serial status
          </ListItem>
          <ListItem compact trailing={isAlive ? "YES" : "NO"}>
            Firmware connection alive
          </ListItem>
          <ListItem compact trailing={areMotorsConnected ? "YES" : "NO"}>
            Motors connected
          </ListItem>
          <ListItem compact trailing={new Date(timer).toLocaleTimeString()}>
            Timer
          </ListItem>
          <ListItem compact trailing={lastHeartbeatTime ? lastHeartbeatTime.toLocaleTimeString() : "n/a"}>
            Last heartbeat time
          </ListItem>
          <ListItem
            compact
            trailing={logMessages.length}
            onClick={() =>
              history.push(
                buildUrl<MainMenuViewParams>(MAIN_MENU_VIEW_PATH, {
                  menu: "settings",
                  page: "experiments",
                  modifier: "log",
                }),
              )
            }
          >
            Log message count
          </ListItem>
          <ListItem compact trailing={voltage ? `${voltage.toFixed(1)}V` : "n/a"}>
            Voltage
          </ListItem>
          <ListItem compact trailing={load ? `${load}%` : "n/a"}>
            Firmware main loop load
          </ListItem>
          <ListItem compact trailing={loopFrequency ? `${loopFrequency}Hz` : "n/a"}>
            Firmware main loop update frequency
          </ListItem>
          <ListItem compact trailing={attitude ? `${attitude.roll.toFixed(2)}°` : "n/a"}>
            Attitude roll
          </ListItem>
          <ListItem compact trailing={attitude ? `${attitude.pitch.toFixed(2)}°` : "n/a"}>
            Attitude pitch
          </ListItem>
          <ListItem compact trailing={attitude ? `${attitude.yaw.toFixed(2)}°` : "n/a"}>
            Attitude yaw
          </ListItem>
          <ListItem compact trailing={buttons.left ? "pressed" : "released"}>
            Left button
          </ListItem>
          <ListItem compact trailing={buttons.right ? "pressed" : "released"}>
            Right button
          </ListItem>
          <ListItem compact trailing={buttons.start ? "pressed" : "released"}>
            Start button
          </ListItem>
          <ListItem compact trailing={`${currents.left.toFixed(2)}A`} onClick={() => robot.requestCurrent()}>
            Left motor current
          </ListItem>
          <ListItem compact trailing={`${currents.right.toFixed(2)}A`} onClick={() => robot.requestCurrent()}>
            Right motor current
          </ListItem>
          <ListItem compact trailing={targetSpeeds.left}>
            Left motor target speed
          </ListItem>
          <ListItem compact trailing={targetSpeeds.right}>
            Right motor target speed
          </ListItem>
          <ListItem compact trailing={currentSpeeds.left}>
            Left motor current speed
          </ListItem>
          <ListItem compact trailing={currentSpeeds.right}>
            Right motor current speed
          </ListItem>
          <ListItem compact trailing={encoders.left}>
            Left encoder
          </ListItem>
          <ListItem compact trailing={encoders.right}>
            Right encoder
          </ListItem>
          <ListItem compact trailing={lidarStatus ? (lidarStatus.isRunning ? "YES" : "NO") : "n/a"}>
            Lidar running
          </ListItem>
          <ListItem compact trailing={lidarStatus ? (lidarStatus.isValid ? "YES" : "NO") : "n/a"}>
            Lidar valid
          </ListItem>
          <ListItem compact trailing={lidarStatus ? lidarStatus.targetRpm : "n/a"}>
            Lidar target RPM
          </ListItem>
          <ListItem compact trailing={lidarStatus ? lidarStatus.currentRpm : "n/a"}>
            Lidar current RPM
          </ListItem>
          <ListItem compact trailing={lidarStatus ? `${lidarStatus.motorPwm}%` : "n/a"}>
            Lidar PWM duty cycle
          </ListItem>
          <ListItem compact trailing={usb?.vendorId ?? "n/a"}>
            USB vendor id
          </ListItem>
          <ListItem compact trailing={usb?.productId ?? "n/a"}>
            USB product id
          </ListItem>
          <ListItem compact trailing={usb?.name ?? "n/a"}>
            USB name
          </ListItem>
          <ListItem compact trailing={lidarMeasurements.length}>
            Lidar measurement count
          </ListItem>
          <ListItem compact trailing={renderCount}>
            Render count
          </ListItem>
        </List>
      </Column>
      <ButtonGroup equalWidth>
        <ButtonGroupButton tertiary onClick={() => robot.setMotorsTargetRpm(1000, 1000)}>
          Start motors
        </ButtonGroupButton>
        <ButtonGroupButton tertiary onClick={() => robot.setMotorsTargetRpm(0, 0)}>
          Stop motors
        </ButtonGroupButton>
        <ButtonGroupButton tertiary onClick={() => robot.requestState()}>
          Request state
        </ButtonGroupButton>
      </ButtonGroup>
    </View>
  );
};
