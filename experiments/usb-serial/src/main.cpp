#include "mbed.h"
#include "USBSerial.h"

// usb device configuration (same as defaults)
const uint16_t USB_VENDOR_ID = 0x1f00;
const uint16_t USB_PRODUCT_ID = 0x2012;
const uint16_t USB_PRODUCT_RELEASE = 0x0001;

// log serial configuration
const PinName LOG_SERIAL_TX_PIN = USBTX;
const PinName LOG_SERIAL_RX_PIN = USBRX;
const int LOG_SERIAL_BAUDRATE = 115200;

// setup log and usb serial
Serial logSerial(LOG_SERIAL_TX_PIN, USBRX, LOG_SERIAL_BAUDRATE);
USBSerial usbSerial(USB_VENDOR_ID, USB_PRODUCT_ID, USB_PRODUCT_RELEASE, false);

// setup status LEDs
DigitalOut loopStatusLed(LED1);
DigitalOut connectionStatusLed(LED2);

// timer for blinking a LED to show that the main loop is still active
Timer blinkTimer;

// handles usb serial receive callback
void handleSerialRx()
{
  // proxy all available characters to log serial
  while (usbSerial.available() > 0)
  {
    logSerial.printf("%c", usbSerial.getc());
  }
}

int main()
{
  // listen for usb serial data
  usbSerial.attach(&handleSerialRx);

  blinkTimer.start();

  while (true)
  {
    // run this code every 500ms
    if (blinkTimer.read_ms() >= 500)
    {
      // toggle the loop status led, making it blink when the main loop is running properly
      loopStatusLed = !loopStatusLed;

      // check for usb serial connection status
      if (usbSerial.connected())
      {
        // indicate connected state
        connectionStatusLed = 1;

        // send messages to both log and usb serials
        logSerial.printf("connected\n");
        usbSerial.printf("hey\n");
      }
      else
      {
        // indicate disconnected state
        connectionStatusLed = 0;

        logSerial.printf("disconnected\n");
      }

      blinkTimer.reset();
    }
  }
}
