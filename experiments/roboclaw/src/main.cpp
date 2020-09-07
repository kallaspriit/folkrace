#include <mbed.h>

// #include <MotorController.hpp>
#include <RoboClaw.hpp>

const uint8_t MOTOR_CONTROLLER_ADDRESS = 128;
const int MOTOR_SERIAL_BAUDRATE = 460800;
// const int MOTOR_SERIAL_BAUDRATE = 38400;
const PinName MOTOR_SERIAL_TX_PIN = p13;
const PinName MOTOR_SERIAL_RX_PIN = p14;
const uint32_t MOTOR_SERIAL_TIMEOUT_US = 10000;

const int US_IN_SECONDS = 1000000;

const int TARGET_LOOP_UPDATE_RATE = 100; // hz
const int TARGET_LOOP_DURATION_US = US_IN_SECONDS / TARGET_LOOP_UPDATE_RATE;

Serial logSerial(USBTX, USBRX, 115200);
Serial motorsSerial(MOTOR_SERIAL_TX_PIN, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_BAUDRATE);

DigitalOut loopStatusLed(LED1);

// MotorController motors(MOTOR_CONTROLLER_ADDRESS, MOTOR_SERIAL_BAUDRATE, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_TX_PIN);
// RoboClaw motors(MOTOR_CONTROLLER_ADDRESS, MOTOR_SERIAL_BAUDRATE, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_TX_PIN);
RoboClaw motors(&motorsSerial, MOTOR_SERIAL_TIMEOUT_US);

Timer reportTimer;
Timer loopTimer;

int load = 0;

int main()
{
  // motors.SpeedM1(200);
  // motors.setSpeedM1(1000);

  // put your setup code here, to run once:

  int currentSpeed = 0;
  int changeSpeed = 1000;
  int range = 1000;
  int direction = 1;

  reportTimer.start();
  loopTimer.start();

  while (1)
  {
    int loopDurationUs = loopTimer.read_us();
    loopTimer.reset();

    loopStatusLed = !loopStatusLed;

    int step = changeSpeed * ((float)loopDurationUs / (float)US_IN_SECONDS);

    currentSpeed += step * direction;

    if (abs(currentSpeed) > range)
    {
      currentSpeed = range * direction;
      direction *= -1;
    }

    // motors.setSpeedM1(currentSpeed);
    // motors.setSpeedM2(currentSpeed);

    // motors.SpeedM1(MOTOR_CONTROLLER_ADDRESS, currentSpeed);
    // motors.SpeedM2(MOTOR_CONTROLLER_ADDRESS, currentSpeed);
    motors.SpeedM1M2(MOTOR_CONTROLLER_ADDRESS, currentSpeed, currentSpeed);

    // uint8_t statusM1, statusM2;
    // bool validM1, validM2;
    uint32_t encoderM1, encoderM2;

    // int encoderM1 = (int)motors.ReadEncM1(MOTOR_CONTROLLER_ADDRESS, &statusM1, &validM1);
    // int encoderM2 = (int)motors.ReadEncM2(MOTOR_CONTROLLER_ADDRESS, &statusM2, &validM2);

    // uint32_t encoderM1, encoderM2;

    bool readSuccess = motors.ReadEncoders(MOTOR_CONTROLLER_ADDRESS, encoderM1, encoderM2);

    // printf("e:%d:%lu:%lu:%d:%d:%d:%d!\n", speed, encoderM1, encoderM2, statusM1, statusM2, validM1, validM2);
    // printf("M1 speed:%d, encoder: %lu, status: %d, valid: %d!\n", speed, encoderM1, statusM1, validM1);
    // printf("M2 speed:%d, encoder: %lu, status: %d, valid: %d!\n", speed, encoderM2, statusM2, validM2);

    // if (!validM1)
    // {
    //   printf("\nF1");
    // }

    // if (!validM2)
    // {
    //   printf("\nF2");
    // }

    if (reportTimer.read_ms() >= 1000)
    {
      // printf("\ne:%d:%d:%d:%d:%d:%d\n", encoderM1, encoderM2, validM1, validM2, loopDurationUs, load);
      // printf("\ne:%d:%d:%d\n", encoderM1, validM1, loopDurationUs);
      printf("success: %d, e1: %d, e2: %d, loop: %d, load: %d\n", readSuccess, (int)encoderM1, (int)encoderM2, loopDurationUs, load);

      reportTimer.reset();
    }

    // logSerial.putc('.');

    // int encoderM1 = motors.getEncoderDeltaM1();
    // int encoderM2 = motors.getEncoderDeltaM2();

    int loopTimeTaken = loopTimer.read_us();

    load = loopTimeTaken * 100 / TARGET_LOOP_DURATION_US;

    if (loopTimeTaken < TARGET_LOOP_DURATION_US)
    {
      wait_us(TARGET_LOOP_DURATION_US - loopTimeTaken);
    }

    // 100hz
    // wait(1.0f);
    // wait(0.1f);
    // wait(0.01f);
    // wait_us(TARGET_LOOP_DURATION_US - (loopDurationUs - TARGET_LOOP_DURATION_US));
    // wait_us(TARGET_LOOP_DURATION_US);
  }
}