import { atom } from "recoil";
import { getWebsocketHost } from "../services/getWebsocketHost";

export const websocketHostState = atom<string | undefined>({
  key: "websocketHostState",
  default: getWebsocketHost(),
});
