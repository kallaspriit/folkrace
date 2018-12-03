#include <mbed.h>
#include <USBSerial.h>

const uint16_t USB_VENDOR_ID = 0x0d28;  // ARM
const uint16_t USB_PRODUCT_ID = 0x0204; // mbed
const uint16_t USB_PRODUCT_RELEASE = 0x0001;

const int MAX_COMMAND_LENGTH = 128;
const int COMMAND_BUFFER_SIZE = MAX_COMMAND_LENGTH + 1;

const PinName LOG_SERIAL_TX_PIN = USBTX;
const PinName LOG_SERIAL_RX_PIN = USBRX;
const int LOG_SERIAL_BAUDRATE = 921600; // log serial is the built-in usb of the mbed board

char commandBuffer[COMMAND_BUFFER_SIZE];
int commandLength = 0;

Serial logSerial(LOG_SERIAL_TX_PIN, USBRX, LOG_SERIAL_BAUDRATE);
USBSerial appSerial(USB_VENDOR_ID, USB_PRODUCT_ID, USB_PRODUCT_RELEASE, false);

Timer blinkTimer;

DigitalOut statusLed(LED1);

void handleSerialRx()
{
  // read all available characters
  while (appSerial.available() > 0)
  {
    logSerial.printf(".\n");

    // get next character
    char receivedChar = appSerial.getc();

    // logSerial.printf("# received %c (%d), buffer: %s, length: %d\n", receivedChar, receivedChar, commandBuffer, commandLength);

    // consider linefeed as the end of command
    if (receivedChar == '\n')
    {
      logSerial.printf("< %s\n", commandBuffer);

      // reset the buffer
      commandBuffer[0] = '\0';
      commandLength = 0;
    }
    else
    {
      // make sure we don't overflow our buffer
      if (commandLength > MAX_COMMAND_LENGTH - 1)
      {
        logSerial.printf("@ maximum command length is %d characters, stopping at %s\n", MAX_COMMAND_LENGTH, commandBuffer);

        return;
      }

      // append to the command buffer
      commandBuffer[commandLength++] = receivedChar;
      commandBuffer[commandLength] = '\0';
    }
  }
}

int main()
{
  appSerial.attach(&handleSerialRx);

  logSerial.printf("# ready");

  blinkTimer.start();

  while (true)
  {
    if (blinkTimer.read_ms() >= 500)
    {
      statusLed = !statusLed;

      blinkTimer.reset();
    }
  }
}
