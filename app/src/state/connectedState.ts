import { selector } from "recoil";
import { lastBeaconTimeState } from "./lastBeaconTimeState";
import { timerState } from "./timerState";

export const connectedState = selector<boolean>({
  key: "connectedState",
  get: ({ get }) => {
    const lastBeaconTime = get(lastBeaconTimeState);

    // subscibe to timer to resolve this state at interval
    void get(timerState);

    if (!lastBeaconTime) {
      return false;
    }

    // expecting beacon updates every second so consider offline if haven't received one in two seconds
    return Date.now() - lastBeaconTime.getTime() < 2000;
  },
});
