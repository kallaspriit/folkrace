import { Container } from "unstated";

import config from "../config";
import { WebSocketState } from "../lib/web-socket-client/index";

export enum SerialType {
  USB = "usb",
  BLUETOOTH = "bluetooth"
}

export enum SerialState {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
  NOT_SUPPORTED = "NOT_SUPPORTED",
  DEVICE_NOT_FOUND = "DEVICE_NOT_FOUND",
  DISABLED = "DISABLED"
}

export interface Serial {
  type: SerialType;
  state: SerialState;
  deviceName?: string;
}

export type SerialsMap = { [type in keyof typeof SerialType]: Serial };

export interface StatusState {
  readonly webSocketState: WebSocketState;
  readonly serials: SerialsMap;
  readonly batteryVoltage?: number;
}

export enum BatteryState {
  UNKNOWN = "UNKNOWN",
  FULL = "FULL",
  LOW = "LOW",
  CRITICAL = "CRITICAL"
}

export default class StatusContainer extends Container<StatusState> {
  // set initial state
  readonly state: StatusState = {
    serials: {
      BLUETOOTH: {
        type: SerialType.BLUETOOTH,
        state: SerialState.DISCONNECTED,
        deviceName: undefined
      },
      USB: {
        type: SerialType.USB,
        state: SerialState.DISCONNECTED,
        deviceName: undefined
      }
    },
    webSocketState: WebSocketState.DISCONNECTED
  };

  setSerialState(type: SerialType, state: SerialState, deviceName?: string) {
    const typeKey = Object.keys(SerialType).find(
      typeName => SerialType[typeName as keyof typeof SerialType] === type
    ) as keyof typeof SerialType;
    const serials = this.state.serials;

    // update given serial state and status
    serials[typeKey].state = state;
    serials[typeKey].deviceName = deviceName;

    // update serial state
    void this.setState({
      serials
    });
  }

  setWebSocketState(newState: WebSocketState) {
    void this.setState({
      webSocketState: newState
    });
  }

  setBatteryVoltage(batteryVoltage: number | undefined) {
    void this.setState({
      batteryVoltage
    });
  }

  getConnectedSerial(): Serial | undefined {
    const serialNames = Object.keys(
      this.state.serials
    ) as (keyof typeof SerialType)[];
    const connectedSerial = serialNames
      .map(serialName => this.state.serials[serialName])
      .find(serial => serial.state === SerialState.CONNECTED);

    return connectedSerial;
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
