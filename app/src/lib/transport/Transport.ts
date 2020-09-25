export enum TransportStatus {
  DISCONNECTED = "DISCONNECTED",
  CONNECTING = "CONNECTING",
  RECONNECTING = "RECONNECTING",
  CONNECTED = "CONNECTED",
}

export interface TransportListener {
  onStatusChanged(transport: Transport, newStatus: TransportStatus, previousStatus: TransportStatus): void;
  onError(transport: Transport, error?: Error): void;
  onMessageSent(transport: Transport, message: string, wasSentSuccessfully: boolean): void;
  onMessageReceived(transport: Transport, message: string): void;
}

export interface Transport {
  getName(): string;
  isAvailable(): boolean;
  getState(): TransportStatus;
  addListener(listener: TransportListener): void;
  removeListener(listener: TransportListener): void;
  connect(): Promise<void>;
  send(message: string): boolean;
}
