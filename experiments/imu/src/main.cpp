#include "LSM9DS1.h"
// #include "Mahony.h"
#include "MadgwickAHRS.h"

const int AHRS_SAMPLE_FREQUENCY = 100;
const int AHRS_SAMPLE_INTERVAL_MS = 1000 / AHRS_SAMPLE_FREQUENCY;
const int AHRS_REPORT_INTERVAL_MS = 500;

LSM9DS1 imu(p9, p10, 0xD6, 0x3C);
// Mahony ahrs;
Madgwick ahrs(5.0f);
DigitalOut led1(LED1);
DigitalOut led2(LED2);
Serial logSerial(USBTX, USBRX, 921600);
Timer sampleTimer;
Timer reportTimer;

int main()
{
  logSerial.printf("initializing.. ");

  if (!imu.begin())
  {
    logSerial.printf("Failed to communicate with LSM9DS1.\n");

    while (true)
    {
      led1 = !led1;

      wait(0.1);
    }
  }

  logSerial.printf("done!\n");

  logSerial.printf("calibrating.. ");
  imu.calibrate();
  logSerial.printf("done!\n\n");

  ahrs.begin(AHRS_SAMPLE_FREQUENCY);

  sampleTimer.start();
  reportTimer.start();

  while (true)
  {
    if (sampleTimer.read_ms() >= AHRS_SAMPLE_INTERVAL_MS)
    {
      // imu.readTemp();
      imu.readMag();
      imu.readGyro();
      imu.readAccel();

      float gx = imu.calcGyro(imu.gx);
      float gy = imu.calcGyro(imu.gy);
      float gz = imu.calcGyro(imu.gz);

      float ax = imu.calcAccel(imu.ax);
      float ay = imu.calcAccel(imu.ay);
      float az = imu.calcAccel(imu.az);

      float mx = imu.calcMag(imu.mx);
      float my = imu.calcMag(imu.my);
      float mz = imu.calcMag(imu.mz);

      ahrs.update(gx, gy, gz, ax, ay, az, mx, my, mz);

      led1 = !led1;

      sampleTimer.reset();
    }

    if (reportTimer.read_ms() >= AHRS_REPORT_INTERVAL_MS)
    {
      float pitch = ahrs.getPitch();
      float yaw = ahrs.getYaw();
      float roll = ahrs.getRoll();

      // logSerial.printf("read took %d ms\n", readTimeTakenMs);
      // logSerial.printf("%f %f %f %f %f %f %f %f %f\n", gx, gy, gz, ax, ay, az, mx, my, mz);
      logSerial.printf("pitch: %f\n", pitch);
      logSerial.printf("yaw: %f\n", yaw);
      logSerial.printf("roll: %f\n\n", roll);

      led2 = !led2;

      reportTimer.reset();
    }
  }
}