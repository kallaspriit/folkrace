export enum TransportState {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  RECONNECTING = "RECONNECTING",
  CONNECTED = "CONNECTED",
}

export interface TransportListener {
  onStateChanged(
    transport: Transport,
    newState: TransportState,
    previousState: TransportState
  ): void;
  onError(transport: Transport, error?: Error): void;
  onMessageSent(
    transport: Transport,
    message: string,
    wasSentSuccessfully: boolean
  ): void;
  onMessageReceived(transport: Transport, message: string): void;
}

export interface Transport {
  getName(): string;
  isAvailable(): boolean;
  getState(): TransportState;
  addListener(listener: TransportListener): void;
  connect(): Promise<void>;
  send(message: string): boolean;
}
