import { useRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { serverIpState } from "../state/serverIpState";

export function useHandleIpCommand() {
  const [, setServerIp] = useRecoilState(serverIpState);

  // for example "ip:192.168.1.123"
  return (args: string[]) => {
    assertArgumentCount(args, 1);

    const serverIp = args[0];

    setServerIp(serverIp);
  };
}
