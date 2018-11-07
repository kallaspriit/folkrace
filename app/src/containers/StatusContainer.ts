import { Container } from "unstated";

import config from "../config";
import { WebSocketState } from "../lib/web-socket-client/index";

export enum BluetoothState {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  NOT_SUPPORTED = "NOT_SUPPORTED",
  DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
  DISABLED = "DISABLED"
}

export interface StatusState {
  bluetoothState: BluetoothState;
  webSocketState: WebSocketState;
  bluetoothDeviceName?: string;
  batteryVoltage?: number;
}

export enum BatteryState {
  UNKNOWN = "UNKNOWN",
  FULL = "FULL",
  LOW = "LOW",
  CRITICAL = "CRITICAL"
}

export default class StatusContainer extends Container<StatusState> {
  readonly state: StatusState = {
    bluetoothState: BluetoothState.DISCONNECTED,
    webSocketState: WebSocketState.DISCONNECTED
  };

  setBluetoothState(newState: BluetoothState, deviceName?: string) {
    this.setState({
      bluetoothState: newState,
      bluetoothDeviceName: deviceName
    });
  }

  setWebSocketState(newState: WebSocketState) {
    this.setState({
      webSocketState: newState
    });
  }

  setBatteryVoltage(batteryVoltage: number | undefined) {
    this.setState({
      batteryVoltage
    });
  }

  get batteryState(): BatteryState {
    const voltage = this.state.batteryVoltage;

    if (voltage === undefined) {
      return BatteryState.UNKNOWN;
    }

    if (voltage <= config.rules.battery.critical) {
      return BatteryState.CRITICAL;
    } else if (voltage <= config.rules.battery.low) {
      return BatteryState.LOW;
    }

    return BatteryState.FULL;
  }
}