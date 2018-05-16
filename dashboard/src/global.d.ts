interface IApp {
  showToast(message: string): void;
  getIpAddress(): string;
  reload(): void;
}

declare var app: IApp;
