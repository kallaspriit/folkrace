#include <mbed.h>

// #include <MotorController.hpp>
#include <RoboClaw.hpp>

const uint8_t MOTORS_ADDRESS = 128;
// const int MOTOR_SERIAL_BAUDRATE = 38400; // original
const int MOTOR_SERIAL_BAUDRATE = 460800; // maximum
const PinName MOTOR_SERIAL_TX_PIN = p13;
const PinName MOTOR_SERIAL_RX_PIN = p14;

const int MOTORS_TIMEOUT_US = 10000;
const int US_IN_SECONDS = 1000000;
const int LOOP_SLEEP_OVERHEAD_US = 10;

const int TARGET_LOOP_UPDATE_RATE = 100; // hz
const int TARGET_LOOP_DURATION_US = US_IN_SECONDS / TARGET_LOOP_UPDATE_RATE;

Serial logSerial(USBTX, USBRX, 115200);
Serial motorsSerial(MOTOR_SERIAL_TX_PIN, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_BAUDRATE);

DigitalOut loopStatusLed(LED1);

RoboClaw motors(&motorsSerial, MOTORS_TIMEOUT_US);

Timer reportTimer;
Timer loopTimer;

int main()
{
  int currentSpeed = 0;
  int changeSpeed = 500;
  int range = 1000;
  int direction = 1;

  reportTimer.start();
  loopTimer.start();

  while (1)
  {
    // get loop duration
    int loopDurationUs = loopTimer.read_us();
    loopTimer.reset();

    // blink status led
    loopStatusLed = !loopStatusLed;

    // calculate new motor speeds
    int step = (float)changeSpeed * ((float)loopDurationUs / (float)US_IN_SECONDS);

    currentSpeed += step * direction;

    if (abs(currentSpeed) > range)
    {
      currentSpeed = range * direction;
      direction *= -1;
    }

    // update motor speeds
    motors.speedM1M2(MOTORS_ADDRESS, currentSpeed, currentSpeed);

    // read encoders
    uint32_t encoderM1, encoderM2;

    bool readSuccess = motors.readEncoders(MOTORS_ADDRESS, encoderM1, encoderM2);

    // report read failure
    if (!readSuccess)
    {
      logSerial.putc('!');
    }

    // get loop time taken in microseconds
    int loopTimeTakenUs = loopTimer.read_us();

    // report state every second
    if (reportTimer.read_ms() >= 1000)
    {
      // calculate load percentage and fps
      int load = loopTimeTakenUs * 100 / TARGET_LOOP_DURATION_US;
      int fps = ceil(1.0f / ((float)loopDurationUs / (float)US_IN_SECONDS));

      printf("success: %d, e1: %d, e2: %d, loop: %d, load: %d, fps: %d\n", readSuccess, (int)encoderM1, (int)encoderM2, loopDurationUs, load, fps);

      reportTimer.reset();
    }

    // wait if load is under 100%
    if (loopTimeTakenUs + LOOP_SLEEP_OVERHEAD_US < TARGET_LOOP_DURATION_US)
    {
      wait_us(TARGET_LOOP_DURATION_US - loopTimeTakenUs - LOOP_SLEEP_OVERHEAD_US);
    }
  }
}