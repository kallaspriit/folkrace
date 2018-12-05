import * as React from "react";

import { styled } from "../styled";

export interface IconProps {
  url: string;
  width: number;
  height: number;
}

export const Icon = styled.i<IconProps>`
  display: block;
  width: ${props => props.width}px;
  height: ${props => props.height}px;
  mask-image: url(${props => props.url});
  mask-size: ${props => props.height}px ${props => props.width}px;
  mask-repeat: no-repeat;
  mask-position: center center;
  background-color: ${props => props.theme.text.primary};
`;

export const StatusIcon: React.SFC = props => (
  <Icon {...props} url="icons/status.svg" width={37} height={32} />
);

export const MapIcon: React.SFC = props => (
  <Icon {...props} url="icons/map.svg" width={32} height={32} />
);

export const BotIcon: React.SFC = props => (
  <Icon {...props} url="icons/bot.svg" width={27} height={32} />
);

export const RemoteIcon: React.SFC = props => (
  <Icon {...props} url="icons/remote.svg" width={44} height={32} />
);

export const SettingsIcon: React.SFC = props => (
  <Icon {...props} url="icons/settings.svg" width={32} height={32} />
);

export const BluetoothIcon: React.SFC = props => (
  <Icon {...props} url="icons/bluetooth.svg" width={32} height={32} />
);

export const SerialIcon: React.SFC = props => (
  <Icon {...props} url="icons/serial.svg" width={32} height={32} />
);

export const WebsocketIcon: React.SFC = props => (
  <Icon {...props} url="icons/websocket.svg" width={32} height={32} />
);

export const NativeIcon: React.SFC = props => (
  <Icon {...props} url="icons/native.svg" width={32} height={32} />
);

export const BatteryIcon: React.SFC = props => (
  <Icon {...props} url="icons/battery.svg" width={32} height={32} />
);

export const ClearIcon: React.SFC = props => (
  <Icon {...props} url="icons/clear.svg" width={32} height={32} />
);
