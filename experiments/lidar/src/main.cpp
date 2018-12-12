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

// lidar configuration
const float LIDAR_PID_P = 3.0f;
const float LIDAR_PID_I = 1.5f;
const float LIDAR_PID_D = 0.0f;
const float LIDAR_STARTUP_PWM = 0.35f;                                  // should be close to ideal pwm
const float LIDAR_TARGET_RPM = 300.0f;                                  // 5Hz
const int LIDAR_PID_INTERVAL_MS = 1000.0f / (LIDAR_TARGET_RPM / 60.0f); // 200ms at 300rpm (5Hz)

// setup serials
Serial logSerial(LOG_SERIAL_TX_PIN, USBRX, LOG_SERIAL_BAUDRATE);

// setup lidar
Lidar lidar(LIDAR_TX_PIN, LIDAR_RX_PIN, LIDAR_PWM_PIN, LIDAR_PID_P, LIDAR_PID_I, LIDAR_PID_D, LIDAR_PID_INTERVAL_MS, LIDAR_STARTUP_PWM);

// runtime state
int readLidarMeasurementCount = 0;

void stepLidar()
{
  // skip measurements if lidar is not running
  if (!lidar.isRunning())
  {
    readLidarMeasurementCount = lidar.getTotalMeasurementCount();

    return;
  }

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
    printf("l:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d:%d\n", measurement1->angle, measurement1->distance, measurement1->quality, measurement2->angle, measurement2->distance, measurement2->quality, measurement3->angle, measurement3->distance, measurement3->quality, measurement4->angle, measurement4->distance, measurement4->quality);
  } while (true);
}

int main()
{
  // give some time to connect the console before starting
  for (int i = 10; i >= 1; i--)
  {
    printf("%d\n", i);

    wait(1.0f);
  }

  // start the lidar
  printf("starting lidar\n");
  lidar.start();

  // run main loop
  while (true)
  {
    stepLidar();
  }
}
