#include "LSM9DS1.h"

DigitalOut statusLed(LED1);
Serial logSerial(USBTX, USBRX, 921600);
Timer timer;

int main()
{
  logSerial.printf("initializing.. ");

  LSM9DS1 imu(p9, p10, 0xD6, 0x3C);

  if (!imu.begin())
  {
    logSerial.printf("Failed to communicate with LSM9DS1.\n");

    while (true)
    {
      statusLed = !statusLed;

      wait(0.1);
    }
  }

  logSerial.printf("done!\n");

  logSerial.printf("calibrating.. ");
  imu.calibrate();
  logSerial.printf("done!\n");

  timer.start();

  while (true)
  {
    timer.reset();

    // imu.readTemp();
    imu.readMag();
    imu.readGyro();
    imu.readAccel();

    int readTimeTakenMs = timer.read_ms();

    // logSerial.printf("read took %d ms\n", readTimeTakenMs);
    logSerial.printf("%f %f %f %f %f %f %f %f %f\n", imu.calcGyro(imu.gx), imu.calcGyro(imu.gy), imu.calcGyro(imu.gz), imu.calcAccel(imu.ax), imu.calcAccel(imu.ay), imu.calcAccel(imu.az), imu.calcMag(imu.mx), imu.calcMag(imu.my), imu.calcMag(imu.mz));
    //logSerial.printf("%d %d %d\n", imu.calcGyro(imu.gx), imu.calcGyro(imu.gy), imu.calcGyro(imu.gz));
    // logSerial.printf("gyro: %d %d %d\n", imu.gx, imu.gy, imu.gz);
    // logSerial.printf("accel: %d %d %d\n", imu.ax, imu.ay, imu.az);
    // logSerial.printf("mag: %d %d %d\n\n", imu.mx, imu.my, imu.mz);

    statusLed = 1;
    // wait(0.1);
    // statusLed = 0;
    // wait(0.5);
  }
}