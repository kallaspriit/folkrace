#include <mbed.h>
#include <USBSerial.h>

const uint16_t USB_VENDOR_ID = 0x0d28;  // ARM
const uint16_t USB_PRODUCT_ID = 0x0204; // mbed
const uint16_t USB_PRODUCT_RELEASE = 0x0001;

const PinName LOG_SERIAL_TX_PIN = USBTX;
const PinName LOG_SERIAL_RX_PIN = USBRX;
const int LOG_SERIAL_BAUDRATE = 921600; // log serial is the built-in usb of the mbed board

Serial logSerial(LOG_SERIAL_TX_PIN, USBRX, LOG_SERIAL_BAUDRATE);
USBSerial appSerial(USB_VENDOR_ID, USB_PRODUCT_ID, USB_PRODUCT_RELEASE, false);

Timer blinkTimer;

DigitalOut statusLed(LED1);

// void handleSerialRx()
// {
//   // read all available characters
//   while (appSerial.available() > 0)
//   {
//     printf("%c", appSerial.getc());
//   }
// }

int main()
{
  // appSerial.attach(&handleSerialRx);

  logSerial.printf("# ready");

  blinkTimer.start();

  while (true)
  {
    while (appSerial.available() > 0)
    {
      printf("%c", appSerial.getc());
    }

    if (blinkTimer.read_ms() >= 500)
    {
      statusLed = !statusLed;

      blinkTimer.reset();
    }
  }
}
