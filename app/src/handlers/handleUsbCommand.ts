import { ContainerMap } from "../components/Router";

export function handleUsbCommand(args: string[], {  }: ContainerMap) {
  const vendorId = parseInt(args[0], 10);
  const productId = parseInt(args[1], 10);
  const productName = args[2];

  // TODO: store in status?
  console.log("usb", {
    vendorId,
    productId,
    productName
  });
}
