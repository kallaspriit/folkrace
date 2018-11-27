import update from "immutability-helper";
import { Container } from "unstated";

import { config } from "../config";
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
  readonly type: SerialType;
  readonly state: SerialState;
  readonly deviceName?: string;
}

export type SerialsMap = { readonly [type in keyof typeof SerialType]: Serial };

export enum BatteryState {
  UNKNOWN = "UNKNOWN",
  FULL = "FULL",
  LOW = "LOW",
  CRITICAL = "CRITICAL"
}

export interface State {
  readonly webSocketState: WebSocketState;
  readonly serials: SerialsMap;
  readonly batteryVoltage?: number;
  readonly remoteIp?: string;
  readonly lastBeaconTime?: Date;
  readonly lastResetTime?: Date;
  readonly loopFrequency?: number;
  readonly loopTimeUs?: number;
}

export class StatusContainer extends Container<State> {
  readonly state: State = {
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

    // update serial state
    return this.setState(
      update(this.state, {
        serials: {
          [typeKey]: { $merge: { state, deviceName } }
        }
      })
    );
  }

  setWebSocketState(newState: WebSocketState) {
    return this.setState({
      webSocketState: newState
    });
  }

  setBatteryVoltage(batteryVoltage: number | undefined) {
    return this.setState({
      batteryVoltage
    });
  }

  setRemoteIp(remoteIp: string) {
    return this.setState({
      remoteIp
    });
  }

  setLoopStatistics(loopFrequency: number, loopTimeUs: number) {
    return this.setState({
      lastBeaconTime: new Date(),
      loopFrequency,
      loopTimeUs
    });
  }

  setResetReceived() {
    return this.setState({
      lastResetTime: new Date()
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
