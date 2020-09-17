import { selector } from "recoil";
import { lastHeartbeatTimeState } from "./lastHeartbeatTimeState";
import { timerState } from "./timerState";

export const aliveState = selector<boolean>({
  key: "aliveState",
  get: ({ get }) => {
    const lastHeartbeatTime = get(lastHeartbeatTimeState);

    // subscibe to timer to resolve this state at interval
    void get(timerState);

    if (!lastHeartbeatTime) {
      return false;
    }

    // expecting heartbeat updates every second so consider offline if haven't received one in two seconds
    return Date.now() - lastHeartbeatTime.getTime() < 2000;
  },
});
