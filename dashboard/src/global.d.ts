interface IApp {
  showToast(message: string): void;
  getIpAddress(): string;
  reload(): void;
}

interface Window {
  app: IApp;
}
