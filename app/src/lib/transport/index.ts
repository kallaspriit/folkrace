type MessageListenerFn = (message: string) => void;

export interface TransportListener {
  onConnecting(): any;
  onOpen(): any;
  onClose(): any;
  onError(error?: Error): any;
  onMessageSent(message: string): any;
  onMessageReceived(message: string): any;
}

export interface Transport {
  addListener(listener: TransportListener): void;
  send(message: string): void;
}
