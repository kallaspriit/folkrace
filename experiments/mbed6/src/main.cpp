/* mbed Microcontroller Library
 * Copyright (c) 2019 ARM Limited
 * SPDX-License-Identifier: Apache-2.0
 */

#include "mbed.h"
// #include "USBCDC.h"
#include "USBSerial.h"

#include <Commander.hpp>
#include <RoboClaw.hpp>

#include <sstream>
#include <vector>

const uint8_t MOTORS_ADDRESS = 128;
const int MOTORS_TIMEOUT_US = 10000;
const int MOTOR_SERIAL_BAUDRATE = 460800; // not default
const PinName MOTOR_SERIAL_TX_PIN = p13;
const PinName MOTOR_SERIAL_RX_PIN = p14;

static BufferedSerial logSerial(USBTX, USBRX, 115200);
static BufferedSerial motorsSerial(MOTOR_SERIAL_TX_PIN, MOTOR_SERIAL_RX_PIN, MOTOR_SERIAL_BAUDRATE);

// static USBCDC appSerial(false);
static USBSerial appSerial(false);

static Commander logCommander(&logSerial);
static Commander appCommander(&appSerial);

static RoboClaw motors(&motorsSerial, MOTORS_TIMEOUT_US);

// static Commander *commanders[] = {&logCommander, &appCommander};

std::vector<Commander *> commanders;

static DigitalOut led1(LED1);
static DigitalOut led2(LED4);
static Timer performanceTimer;
static Timer statusTimer;
static Ticker statusLedTicker;

const int SEND_BUFFER_SIZE = 64;
static char sendBuffer[SEND_BUFFER_SIZE];

// const char *constantMessage = "@\n";

// void send(const char *fmt, ...)
// {
//   // create formatted message
//   // char sendBuffer[SEND_BUFFER_SIZE];
//   va_list args;
//   va_start(args, fmt);
//   int resultLength = vsnprintf(sendBuffer, SEND_BUFFER_SIZE, fmt, args);
//   va_end(args);

//   logSerial.write(sendBuffer, resultLength);
// }

// void send2(const char *fmt, ...)
// {
//   // create formatted message
//   char sendBuffer2[SEND_BUFFER_SIZE];
//   va_list args;
//   va_start(args, fmt);
//   int resultLength = vsnprintf(sendBuffer2, SEND_BUFFER_SIZE, fmt, args);
//   va_end(args);

//   logSerial.write(sendBuffer2, resultLength);
// }

// sends to both log and app serials
int send(const char *fmt, ...)
{
  va_list args;
  va_start(args, fmt);
  int messageLength = vsnprintf(sendBuffer, SEND_BUFFER_SIZE, fmt, args);
  va_end(args);

  // if (appSerial.ready() && appSerial.connected() && appSerial.configured())
  if (appSerial.connected())
  {
    appSerial.send((uint8_t *)sendBuffer, messageLength);
    // appSerial.write((uint8_t *)sendBuffer, messageLength);

    // uint32_t sentLength;
    // appSerial.send_nb((uint8_t *)sendBuffer, messageLength, &sentLength);

    // if ((int)sentLength != messageLength)
    // {
    //   printf("@ meant to send %d bytes but managed to send %d\n", messageLength, (int)sentLength);
    // }

    logSerial.write("> ", 2);
    logSerial.write((uint8_t *)sendBuffer, messageLength);
  }
  else
  {
    logSerial.write("@ ", 2);
    logSerial.write((uint8_t *)sendBuffer, messageLength);
  }

  return messageLength;
}

void handleHelpCommand(Commander *commander)
{
  commander->send("! available commands:\n");
  commander->send("! - help    - displays this help message\n");
  commander->send("! - sum:a:b - responds with sum of a and b\n");
}

void handleSumCommand(Commander *commander)
{
  unsigned int argumentCount = commander->getArgumentCount();

  if (argumentCount != 2)
  {
    printf("@ 'sum' command expects two int arguments but got %d\n", argumentCount);

    return;
  }

  int a = commander->getIntArgument(0);
  int b = commander->getIntArgument(1);
  int sum = a + b;

  commander->send("sum of %d+%d=%d\n", a, b, sum);
}

void stepStatusLed()
{
  led1 = !led1;
  led2 = !led2;
}

int main()
{
  statusLedTicker.attach(&stepStatusLed, 500ms);

  // register list of commanders
  commanders.push_back(&logCommander);
  commanders.push_back(&appCommander);

  // register command handlers
  for (Commander *commander : commanders)
  {
    commander->registerCommandHandler("help", callback(handleHelpCommand, commander));
    commander->registerCommandHandler("sum", callback(handleSumCommand, commander));
  }

  led1 = 0;
  led2 = 1;

  performanceTimer.start();
  statusTimer.start();

  appSerial.connect();

  // don't want reads to block
  // motorsSerial.set_blocking(false);

  // int counter = 0;

  while (true)
  {
    // attempt to connect if not connected
    logCommander.update();
    appCommander.update();

    // ThisThread::sleep_for(100ms);
    // ThisThread::sleep_for(1s);

    // run this at interval
    // TODO: use Ticker? but would run in IRQ interrupt context so no printf etc
    if (statusTimer.elapsed_time() >= 1000ms)
    {
      statusTimer.reset();

      // if (!appSerial.connected())
      // {
      //   printf("! connecting\n");

      //   appSerial.connect();
      // }

      uint32_t encoderM1, encoderM2;

      bool readSuccess = motors.readEncoders(MOTORS_ADDRESS, encoderM1, encoderM2);

      if (readSuccess)
      {
        printf("e:%d:%d\n", encoderM1, encoderM2);
      }
      else
      {
        printf("@ reading encoders failed\n");
      }

      // printf("! hey\n");

      bool setSpeedSuccess = motors.speedM1M2(MOTORS_ADDRESS, 1000, 1000);

      if (!setSpeedSuccess)
      {
        printf("@ setting motors speed failed\n");
      }

      //   performanceTimer.reset();
      //   printf("%d\n", counter++);
      //   int duration1 = performanceTimer.elapsed_time().count();

      //   performanceTimer.reset();
      //   const char *message = "hello!\n";
      //   logSerial.write(message, strlen(message));
      //   int duration2 = performanceTimer.elapsed_time().count();

      //   performanceTimer.reset();
      //   send("test: %d\n", counter);
      //   int duration3 = performanceTimer.elapsed_time().count();

      //   performanceTimer.reset();
      //   logSerial.write(constantMessage, strlen(constantMessage));
      //   int duration4 = performanceTimer.elapsed_time().count();

      //   performanceTimer.reset();
      //   stringstream ss;
      //   ss << "test: " << counter << "\n";
      //   string msg = ss.str();
      //   logSerial.write(msg.c_str(), msg.length());
      //   int duration5 = performanceTimer.elapsed_time().count();

      //   performanceTimer.reset();
      //   send2("test: %d\n", counter);
      //   int duration6 = performanceTimer.elapsed_time().count();

      //   printf("d1: %d, d2: %d, d3: %d, d4: %d, d5: %d, d6: %d\n", duration1, duration2, duration3, duration4, duration5, duration6);
    }
  }
}
