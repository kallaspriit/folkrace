#include <mbed.h>
// #include <USBSerial.h>

#include <Lidar.hpp>

// pin mapping configuration
const PinName LOG_SERIAL_TX_PIN = USBTX;
const PinName LOG_SERIAL_RX_PIN = USBRX;
const PinName LIDAR_PWM_PIN = p21;
const PinName LIDAR_TX_PIN = p28;
const PinName LIDAR_RX_PIN = p27;

// baud rates configuration
const int LOG_SERIAL_BAUDRATE = 921600; // log serial is the built-in usb of the mbed board

// usb serial configuration (same as USBSerial defaults)
// const uint16_t USB_VENDOR_ID = 0x1f00;
// const uint16_t USB_PRODUCT_ID = 0x2012;
// const uint16_t USB_PRODUCT_RELEASE = 0x0001;

// lidar configuration
const float LIDAR_TARGET_RPM = 300.0f; // 5Hz
const float LIDAR_PID_P = 3.0f;
const float LIDAR_PID_I = 1.5f;
const float LIDAR_PID_D = 0.0f;
const float LIDAR_STARTUP_PWM = 0.35f;                                  // should be close to ideal pwm
const int LIDAR_PID_INTERVAL_MS = 1000.0f / (LIDAR_TARGET_RPM / 60.0f); // 200ms at 300rpm (5Hz)

// main loop configuration
const int TARGET_LOOP_FREQUENCY = 100;
const int TARGET_LOOP_DURATION_US = (1000 / TARGET_LOOP_FREQUENCY) * 1000;

// setup serials
Serial logSerial(LOG_SERIAL_TX_PIN, USBRX, LOG_SERIAL_BAUDRATE);
// USBSerial appSerial(USB_VENDOR_ID, USB_PRODUCT_ID, USB_PRODUCT_RELEASE, false);

// setup lidar
Lidar lidar(LIDAR_TX_PIN, LIDAR_RX_PIN, LIDAR_PWM_PIN, LIDAR_PID_P, LIDAR_PID_I, LIDAR_PID_D, LIDAR_PID_INTERVAL_MS, LIDAR_STARTUP_PWM);

// setup timers
Timer loopTimer;

// setup status leds
DigitalOut loopStatusLed(LED1);

int readLidarMeasurementCount = 0;
int lastLidarRotationCount = 0;

// // returns whether usb serial is connected
// bool isUsbConnected()
// {
//   // get both whether power from the OTG device is detected and serial connection state
//   bool isUsbPowerPresent = usbPowerSense.read() == 1;
//   bool isUsbReportingConnected = appSerial.connected();

//   // require both usb power to be present as well as usb to report as connected (as usb fails to detect disconnects)
//   return isUsbPowerPresent && isUsbReportingConnected;
// }

// TODO: remove mock
bool isUsbConnected()
{
  return true;
}

// // writes app message using either blocking or non-blocking method (consider send instead as it supports printf arguments)
// void sendRaw(const char *message, int length, bool blocking = true)
// {
//   // don't attempt to send if not connected as writing is blocking
//   if (!isUsbConnected())
//   {
//     logSerial.printf("@ %s", message);

//     return;
//   }

//   // write either as blocking or non-blocking
//   if (blocking)
//   {
//     appSerial.writeBlock((uint8_t *)message, length);
//   }
//   else
//   {
//     appSerial.writeNB(EPBULK_IN, (uint8_t *)message, length, MAX_PACKET_SIZE_EPBULK);
//   }

//   // only log messages that are not a single character (high speed data)
//   if (length > 2 && message[1] != ':')
//   {
//     logSerial.printf("> %s", message);
//   }

//   // reset the app message sent timer if at least twice the blink duration has passed
//   if (appMessageSentTimer.read_ms() >= LED_BLINK_DURATION_MS * 2)
//   {
//     appMessageSentTimer.reset();
//   }
// }

// // sends given printf-formatted message to app serial if connected
// void send(const char *fmt, ...)
// {
//   // create formatted message
//   char buf[MAX_PACKET_SIZE_EPBULK];
//   va_list args;
//   va_start(args, fmt);
//   int resultLength = vsnprintf(buf, MAX_PACKET_SIZE_EPBULK, fmt, args);
//   va_end(args);

//   // write as non-blocking
//   sendRaw(buf, resultLength, true);
// }

// // sends given printf-formatted message to app serial if connected
// void sendAsync(const char *fmt, ...)
// {
//   // create formatted message
//   char buf[MAX_PACKET_SIZE_EPBULK];
//   va_list args;
//   va_start(args, fmt);
//   int resultLength = vsnprintf(buf, MAX_PACKET_SIZE_EPBULK, fmt, args);
//   va_end(args);

//   // write as non-blocking
//   sendRaw(buf, resultLength, false);
// }

// void setupUsbPowerSensing()
// {
//   usbPowerSense.mode(PullDown);
// }

// void stepUsbConnectionState()
// {
//   // get usb connection state (also checks for usb power as the USBSerial fails to detect disconnect)
//   bool isConnected = isUsbConnected();

//   // light up status led 2 when the usb is connected
//   if (isConnected != wasUsbConnected)
//   {
//     // notify usb connection state change
//     logSerial.printf("# usb %s\n", isConnected ? "connected" : "disconnected");

//     // notify app of reset
//     if (isConnected)
//     {
//       // notify of reset
//       send("reset\n");
//     }

//     wasUsbConnected = isConnected;
//   }

//   if (isConnected && appMessageSentTimer.read_ms() < LED_BLINK_DURATION_MS)
//   {
//     // turn the usb status led off for a brief duration when transmitting data
//     usbStatusLed = 0;
//   }
//   else
//   {
//     // turn the usb status led on when connected
//     usbStatusLed = isConnected ? 1 : 0;
//   }
// }

void stepLidar()
{
  // report lidar state at an interval
  // if (reportLidarStateTimer.read_ms() >= LIDAR_REPORT_STATE_INTERVAL_MS && isUsbConnected())
  // {
  //   reportLidarState();

  //   reportLidarStateTimer.reset();
  // }

  // skip measurements if no usb connection is available or lidar is not running
  if (!isUsbConnected() || !lidar.isRunning())
  {
    readLidarMeasurementCount = lidar.getTotalMeasurementCount();

    return;
  }

  int rotationCount = lidar.getRotationCount();

  if (rotationCount != lastLidarRotationCount)
  {
    // report lidar state
    logSerial.printf(
        "total: %d, read: %d, invalid: %d, weak: %d, out of order: %d, rotations: %d, rpm: %f, pwm: %f\n",
        lidar.getTotalMeasurementCount(),
        readLidarMeasurementCount,
        lidar.getInvalidMeasurementCount(),
        lidar.getWeakMeasurementCount(),
        lidar.getOutOfOrderMeasurementCount(),
        lidar.getRotationCount(),
        lidar.getCurrentRpm(),
        lidar.getMotorPwm());
  }

  lastLidarRotationCount = rotationCount;

  // loop through unseen lidar measurements
  do
  {
    // get number of queued measurements
    int queuedMeasurementCount = lidar.getTotalMeasurementCount() - readLidarMeasurementCount;

    // break if we have no new set of 4 new measurements available
    if (queuedMeasurementCount < 4)
    {
      break;
    }

    // get the measurements
    Lidar::Measurement *measurement1 = lidar.getMeasurement(readLidarMeasurementCount++);
    Lidar::Measurement *measurement2 = lidar.getMeasurement(readLidarMeasurementCount++);
    Lidar::Measurement *measurement3 = lidar.getMeasurement(readLidarMeasurementCount++);
    Lidar::Measurement *measurement4 = lidar.getMeasurement(readLidarMeasurementCount++);

    // send the measurements
    logSerial.printf("l:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d\n", measurement1->angle, measurement1->distance, measurement1->quality, measurement2->angle, measurement2->distance, measurement2->quality, measurement3->angle, measurement3->distance, measurement3->quality, measurement4->angle, measurement4->distance, measurement4->quality);
  } while (true);
}

void stepLoopTimer()
{
  // blink the loop status led
  loopStatusLed = !loopStatusLed;

  // read the loop time in microseconds and reset the timer
  // int lastLoopTimeUs = loopTimer.read_us();
  // int sleepTimeUs = TARGET_LOOP_DURATION_US - lastLoopTimeUs;

  // // sleep to attempt to match target loop frequency
  // if (sleepTimeUs > 0)
  // {
  //   wait_us(sleepTimeUs);
  // }

  loopTimer.reset();
}

void setupTimers()
{
  // start timers
  loopTimer.start();
}

int main()
{
  // wait before starting
  wait(10.0f);

  // setup resources
  // setupUsbPowerSensing();
  setupTimers();

  logSerial.printf("# starting lidar\n");

  // start the lidar
  lidar.start();

  // run main loop
  while (true)
  {
    // stepUsbConnectionState();
    stepLidar();
    stepLoopTimer();

    // stop the lidar after running for 30 seconds
    if (lidar.isRunning() && lidar.getRunningDurationMs() > 30 * 1000)
    {
      logSerial.printf("# stopping lidar\n");

      lidar.stop();

      readLidarMeasurementCount = 0;
    }
  }
}
