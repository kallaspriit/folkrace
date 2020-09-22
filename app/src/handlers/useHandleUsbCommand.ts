import { useRecoilState } from "recoil";
import { assertArgumentCount } from "../services/assertArgumentCount";
import { usbState } from "../state/usbState";

export function useHandleUsbCommand() {
  const [, setUsb] = useRecoilState(usbState);

  // for example "usb:7936:8210:CDC DEVICE" means usb device called "CDC DEVICE" with vendor id 7936 and product id 8210
  return (args: string[]) => {
    assertArgumentCount(args, 3);

    const vendorId = parseInt(args[0], 10);
    const productId = parseInt(args[1], 10);
    const name = args[2];

    setUsb({
      vendorId,
      productId,
      name,
    });
  };
}
