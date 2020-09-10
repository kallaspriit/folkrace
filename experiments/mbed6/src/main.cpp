/* mbed Microcontroller Library
 * Copyright (c) 2019 ARM Limited
 * SPDX-License-Identifier: Apache-2.0
 */

#include "mbed.h"

#include <sstream>

const int MAX_SERIAL_MESSAGE_LENGTH = 64;

static BufferedSerial logSerial(USBTX, USBRX, 115200);
static DigitalOut led(LED1);
static DigitalOut led2(LED4);
static Timer timer;

static char sendBuffer[MAX_SERIAL_MESSAGE_LENGTH];
const char *constantMessage = "@\n";

void send(const char *fmt, ...)
{
  // create formatted message
  // char sendBuffer[MAX_SERIAL_MESSAGE_LENGTH];
  va_list args;
  va_start(args, fmt);
  int resultLength = vsnprintf(sendBuffer, MAX_SERIAL_MESSAGE_LENGTH, fmt, args);
  va_end(args);

  logSerial.write(sendBuffer, resultLength);
}

void send2(const char *fmt, ...)
{
  // create formatted message
  char sendBuffer2[MAX_SERIAL_MESSAGE_LENGTH];
  va_list args;
  va_start(args, fmt);
  int resultLength = vsnprintf(sendBuffer2, MAX_SERIAL_MESSAGE_LENGTH, fmt, args);
  va_end(args);

  logSerial.write(sendBuffer2, resultLength);
}

int main()
{
  // Initialise the digital pin LED1 as an output

  led2 = 1;

  int counter = 0;

  timer.start();

  while (true)
  {
    led = !led;
    led2 = !led2;

    // ThisThread::sleep_for(100ms);
    ThisThread::sleep_for(1s);

    timer.reset();
    printf("%d\n", counter++);
    int duration1 = timer.elapsed_time().count();

    timer.reset();
    const char *message = "hello!\n";
    logSerial.write(message, strlen(message));
    int duration2 = timer.elapsed_time().count();

    timer.reset();
    send("test: %d\n", counter);
    int duration3 = timer.elapsed_time().count();

    timer.reset();
    logSerial.write(constantMessage, strlen(constantMessage));
    int duration4 = timer.elapsed_time().count();

    timer.reset();
    stringstream ss;
    ss << "test: " << counter << "\n";
    string msg = ss.str();
    logSerial.write(msg.c_str(), msg.length());
    int duration5 = timer.elapsed_time().count();

    timer.reset();
    send2("test: %d\n", counter);
    int duration6 = timer.elapsed_time().count();

    printf("d1: %d, d2: %d, d3: %d, d4: %d, d5: %d, d6: %d\n", duration1, duration2, duration3, duration4, duration5, duration6);
  }
}
