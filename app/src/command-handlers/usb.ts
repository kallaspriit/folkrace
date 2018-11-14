import { ContainerMap } from "../components/glue/ConnectionManager";

export default function handleUsbCommand(args: string[], {  }: ContainerMap) {
  const vendorId = parseInt(args[0], 10);
  const productId = parseInt(args[1], 10);
  const productName = args[2];

  // console.log("usb", {
  //   vendorId,
  //   productId,
  //   productName
  // });
}
