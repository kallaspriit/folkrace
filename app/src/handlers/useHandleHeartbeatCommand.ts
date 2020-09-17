import { useRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { lastHeartbeatTimeState } from "../state/lastHeartbeatTimeState";
import { loadState } from "../state/loadState";
import { loopFrequencyState } from "../state/loopFrequencyState";

export function useHandleHeartbeatCommand() {
  const [, setLoad] = useRecoilState(loadState);
  const [, setLoopFrequency] = useRecoilState(loopFrequencyState);
  const [, setLastHeartbeatTimeState] = useRecoilState(lastHeartbeatTimeState);

  // for example "b:100:12" means 100Hz update rate at 12% load
  return (args: string[]) => {
    assertArgumentCount(args, 2);

    const loopFrequency = parseInt(args[0], 10);
    const loadPercentage = parseInt(args[1], 10);

    setLoad(loadPercentage);
    setLoopFrequency(loopFrequency);
    setLastHeartbeatTimeState(new Date());
  };
}
