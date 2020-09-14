import { useRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { lastBeaconTimeState } from "../state/lastBeaconTimeState";
import { loadState } from "../state/loadState";
import { loopFrequencyState } from "../state/loopFrequencyState";

export function useHandleBeaconCommand() {
  const [, setLoad] = useRecoilState(loadState);
  const [, setLoopFrequency] = useRecoilState(loopFrequencyState);
  const [, setLastBeaconTimeState] = useRecoilState(lastBeaconTimeState);

  // for example "b:100:12" means 100Hz update rate at 12% load
  return (args: string[]) => {
    assertArgumentCount(args, 2);

    const loopFrequency = parseInt(args[0], 10);
    const loadPercentage = parseInt(args[1], 10);

    setLoad(loadPercentage);
    setLoopFrequency(loopFrequency);
    setLastBeaconTimeState(new Date());
  };
}
