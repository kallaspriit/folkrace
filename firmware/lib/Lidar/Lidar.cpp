#include "Lidar.hpp"

#include <mbed.h>
#include <Callback.h>

Lidar::Lidar(PinName txPin, PinName rxPin, PinName motorPwmPin, float pidP, float pidI, float pidD, int pidIntervalMs, float startupPwm) : serial(txPin, rxPin, 115200),
                                                                                                                                           motorPwm(motorPwmPin),
                                                                                                                                           motorPid(pidP, pidI, pidD, (float)pidIntervalMs / 1000.0f),
                                                                                                                                           pidIntervalMs(pidIntervalMs),
                                                                                                                                           startupPwm(startupPwm)
{
  // configure PID controller limits
  motorPid.setInputLimits(0.0f, 400.0f); // motor rpm
  motorPid.setOutputLimits(0.0f, 1.0f);  // motor pwm

  // stop the motor initially
  setMotorPwm(0);
}

bool Lidar::isRunning()
{
  return running;
}

bool Lidar::isValid()
{
  if (!running)
  {
    return false;
  }

  // threshold for valid duration
  float rotationDurationValidThreshold = 0.2f;
  int minRotationDurationMs = (float)expectedRotationDurationMs * (1.0f - rotationDurationValidThreshold / 2.0f);
  int maxRotationDurationMs = (float)expectedRotationDurationMs * (1.0f + rotationDurationValidThreshold / 2.0f);

  // consider invalid if the last cycle has taken too long or short time
  if (lastRotationDurationMs < minRotationDurationMs || lastRotationDurationMs > maxRotationDurationMs)
  {
    return false;
  }

  return true;
}

void Lidar::setMotorPwm(float pwm)
{
  motorPwm.write(pwm);

  motorPwmDuty = pwm;
}

float Lidar::getMotorPwm()
{
  return motorPwmDuty;
}

void Lidar::start(float targetRpm)
{
  setTargetRpm(targetRpm);
}

void Lidar::stop()
{
  setTargetRpm(0);
}

void Lidar::setTargetRpm(float newTargetRpm)
{
  // accept only positive rpm
  if (newTargetRpm < 0)
  {
    newTargetRpm = 0;
  }

  // update target rpm
  targetRpm = newTargetRpm;

  // set new pid controller set-point
  motorPid.setSetPoint(newTargetRpm);

  if (targetRpm > 0.0f)
  {
    // calculate expected rotation duration, used to detect invalid state
    expectedRotationDurationMs = 1000 / ((int)targetRpm / 60);

    // start the lidar if it was not already running
    if (!running)
    {
      // start the timers
      runningTimer.start();

      // start the motor initially with a set pwm value
      setMotorPwm(startupPwm);

      // lidar is now running
      running = true;
    }
  }
  else
  {
    // check whether the lidar was previously running
    if (running)
    {
      // stop the motor
      setMotorPwm(0);

      // stop timers
      rotationTimer.stop();
      runningTimer.stop();

      // reset timers
      rotationTimer.reset();
      runningTimer.reset();

      // reset state
      running = false;
      packetErrorCount = 0;
      receivedMeasurementCount = 0;
      invalidMeasurementCount = 0;
      weakMeasurementCount = 0;
      outOfOrderMeasurementCount = 0;
      rotationCount = 0;
      expectedRotationDurationMs = 0;
      lastRotationDurationMs = 0;
      lastMeasurementAngle = -1;
      state = WAIT_FOR_START_BYTE;
      packetByteIndex = 0;
    }
  }
}

float Lidar::getCurrentRpm()
{
  // return zero if lidar is currently not valid
  // if (!isValid())
  // {
  //   return 0.0f;
  // }

  return currentMotorRpm;
}

Lidar::Measurement *Lidar::getMeasurement(int number)
{
  int index = number % MEASUREMENT_BUFFER_SIZE;
  Measurement *measurement = &measurements[index];

  return measurement;
}

void Lidar::update()
{
  if (!running)
  {
    return;
  }

  int readLength = serial.read(readBuffer, READ_BUFFER_SIZE);

  if (readLength == 0)
  {
    return;
  }

  for (int i = 0; i < readLength; i++)
  {
    char receivedChar = readBuffer[i];

    // execute the state machine
    switch (state)
    {
    case WAIT_FOR_START_BYTE:
      handleWaitForStartByte(receivedChar);
      break;

    case BUILD_PACKET:
      handleBuildPacket(receivedChar);
      break;
    }
  }
}

void Lidar::handleWaitForStartByte(uint8_t inByte)
{
  // ignore characters not matching the start byte
  if (inByte != PACKET_START_BYTE)
  {
    return;
  }

  // move to building packet state and store the byte
  state = BUILD_PACKET;
  packet[packetByteIndex++] = inByte;
}

void Lidar::handleBuildPacket(uint8_t inByte)
{
  // keep storing bytes into the packet
  packet[packetByteIndex++] = inByte;

  // check whether we've reached the end of the packet
  bool isPacketComplete = packetByteIndex == PACKET_LENGTH;

  // process the packet once complete
  if (isPacketComplete)
  {
    processPacket();
  }
}

void Lidar::processPacket()
{
  // handle invalid packet
  if (!isPacketValid())
  {
    // printf("@ CRC\n");

    packetErrorCount++;

    resetPacket();

    return;
  }

  // process motor rpm info
  // processRpm();

  // get the starting angle of this group (of 4), e.g., 0, 4, 8, 12, ...
  int packetStartAngle = getPacketStartAngle();

  // handle full rotation
  if (packetStartAngle == 0 && lastMeasurementAngle == 359)
  {
    handleRotationComplete();
  }

  // loop through the set of 4 measurements
  for (int quadIndex = 0; quadIndex < N_DATA_QUADS; quadIndex++)
  {
    // process distance and signal strength (quality)
    processDistance(quadIndex);
    processSignalStrength(quadIndex);

    // calculate circular buffer measurement index
    int measurementIndex = (receivedMeasurementCount++) % MEASUREMENT_BUFFER_SIZE;

    // update measurement info
    measurements[measurementIndex].angle = packetStartAngle + quadIndex;
    measurements[measurementIndex].distance = packetDistance[quadIndex];
    measurements[measurementIndex].quality = packetSignalStrength[quadIndex];
    measurements[measurementIndex].isInvalid = packetInvalidFlag[quadIndex] & INVALID_DATA_FLAG;
    measurements[measurementIndex].isWeak = packetInvalidFlag[quadIndex] & STRENGTH_WARNING_FLAG;

    // printf("@ %d (%d)\n", packetStartAngle + quadIndex, measurementIndex);

    // update invalid measurement counter
    if (measurements[measurementIndex].isInvalid)
    {
      invalidMeasurementCount++;
    }

    // update weak measurement counter
    if (measurements[measurementIndex].isWeak)
    {
      weakMeasurementCount++;
    }

    // check whether given measurement arrived out of order (expect angle difference to be one for ordered measurement)
    int angleDifference = (measurements[measurementIndex].angle - lastMeasurementAngle) % 360 + (lastMeasurementAngle == 359 ? 360 : 0);
    bool isOutOfOrder = angleDifference != 1;

    // update out of order measurement counter
    if (isOutOfOrder)
    {
      outOfOrderMeasurementCount++;
    }

    // store last measurement angle
    lastMeasurementAngle = measurements[measurementIndex].angle;
  }

  resetPacket();
}

void Lidar::resetPacket()
{
  // reset data and metrics
  for (int quadIndex = 0; quadIndex < N_DATA_QUADS; quadIndex++)
  {
    packetDistance[quadIndex] = 0;
    packetSignalStrength[quadIndex] = 0;
    packetInvalidFlag[quadIndex] = 0;
  }

  // clear out packet contents
  for (packetByteIndex = 0; packetByteIndex < PACKET_LENGTH; packetByteIndex++)
  {
    packet[packetByteIndex] = 0;
  }

  // reset packet byte index
  packetByteIndex = 0;

  // go back to waiting for start byte packet
  state = WAIT_FOR_START_BYTE;
}

bool Lidar::isPacketValid()
{
  // setup crc array
  const int bytesToCheck = PACKET_LENGTH - 2;
  const int crcLength = bytesToCheck / 2;
  unsigned int crc[crcLength];

  // initialize crc array
  for (int i = 0; i < crcLength; i++)
  {
    crc[i] = 0;
  }

  // build crc array
  for (int i = 0; i < bytesToCheck; i += 2)
  {
    crc[i / 2] = packet[i] + ((packet[i + 1]) << 8);
  }

  unsigned long chk32 = 0;

  for (int i = 0; i < crcLength; i++)
  {
    chk32 = (chk32 << 1) + crc[i];
  }

  // calculate checksum
  unsigned long checksum = (chk32 & 0x7FFF) + (chk32 >> 15);
  checksum &= 0x7FFF;

  uint8_t b1a = checksum & 0xFF;
  uint8_t b1b = packet[OFFSET_TO_CRC_L];
  uint8_t b2a = checksum >> 8;
  uint8_t b2b = packet[OFFSET_TO_CRC_M];

  if ((b1a == b1b) && (b2a == b2b))
  {
    return true;
  }

  return false;
}

int Lidar::getPacketStartAngle()
{
  int dataFourDegreesIndex = packet[OFFSET_TO_INDEX] - INDEX_LO;
  int angle = dataFourDegreesIndex * N_DATA_QUADS;

  return angle;
}

// void Lidar::processRpm()
// {
//   // extract the bytes
//   uint8_t motorRphLowByte = packet[OFFSET_TO_SPEED_LSB];
//   uint8_t motorRphHighByte = packet[OFFSET_TO_SPEED_MSB];
//   // uint8_t motorRph = (motorRphHighByte << 8) | motorRphLowByte;

//   // calculate current rpm
//   currentMotorRpm = float((motorRphHighByte << 8) | motorRphLowByte) / 64.0f;

//   // don't use the pid loop for the first few seconds letting the lidar to start up
//   if (runningTimer.read_ms() < 2000)
//   {
//     return;
//   }

//   // update the pid controller at a certain interval
//   if (pidTimer.read_ms() < pidIntervalMs)
//   {
//     return;
//   }

//   // update pid process value (current rpm)
//   motorPid.setProcessValue(currentMotorRpm);

//   // let the pid controller compute new motor pwm
//   float newMotorPwm = motorPid.compute();

//   // printf("! pwm: %f, rpm: %f, sum: %f, count: %d\n", newMotorPwm, currentMotorRpm, motorRpmSum, motorRpmCount);

//   setMotorPwm(newMotorPwm);

//   // reset motor rpm average variables
//   motorRpmSum = 0;
//   motorRpmCount = 0;

//   // reset pid interval timer
//   pidTimer.reset();
// }

void Lidar::handleRotationComplete()
{
  // let it stabilize for a while at the startup pwm
  if (runningTimer.elapsed_time() < 3s)
  {
    return;
  }

  // start the rotation timer when the first rotation is completed
  if (rotationTimer.elapsed_time() == 0ms)
  {
    rotationTimer.start();

    return;
  }

  // get time taken to complete one full rotation
  lastRotationDurationMs = std::chrono::duration_cast<std::chrono::milliseconds>(rotationTimer.elapsed_time()).count();

  // ignore unrealistically short rotation durations
  // if (lastRotationDurationMs < expectedRotationDurationMs / 2)
  // {
  //   printf("@ invalid rotation duration: %d\n", lastRotationDurationMs);

  //   return;
  // }

  // calculate motor rpm from rotation time
  currentMotorRpm = (1000.0f / (float)lastRotationDurationMs) * 60.0f;

  // update pid process value (current rpm)
  motorPid.setProcessValue(currentMotorRpm);

  // let the pid controller compute new motor pwm
  float newMotorPwm = motorPid.compute();

  // update motor pwm
  setMotorPwm(newMotorPwm);

  // rotation complete, reset the timer
  rotationTimer.reset();

  // increment total number of rotations
  rotationCount++;
}

void Lidar::processDistance(int quadIndex)
{
  int offset = OFFSET_TO_4_DATA_READINGS + (quadIndex * N_DATA_QUADS) + OFFSET_DATA_DISTANCE_LSB;

  // byte 1 : <"invalid data" flag> <"strength warning" flag> <distance 13:8> (MSB)
  uint8_t dataLSB = packet[offset];
  uint8_t dataMSB = packet[offset + 1];

  bool isBadData = dataMSB & BAD_DATA_MASK;

  // check for bad distance measurement
  if (isBadData)
  {
    packetDistance[quadIndex] = 0;
    packetInvalidFlag[quadIndex] = dataMSB & BAD_DATA_MASK;
  }

  // distance measurement is good
  packetDistance[quadIndex] = dataLSB | ((dataMSB & 0x3F) << 8);
  packetInvalidFlag[quadIndex] = 0;
}

void Lidar::processSignalStrength(int quadIndex)
{
  // consider strength to be 0 for invalid measurements
  if (packetInvalidFlag[quadIndex] != 0)
  {
    packetSignalStrength[quadIndex] = 0;

    return;
  }

  int offset = OFFSET_TO_4_DATA_READINGS + (quadIndex * N_DATA_QUADS) + OFFSET_DATA_SIGNAL_LSB;

  uint8_t dataLSB = packet[offset];
  uint8_t dataMSB = packet[offset + 1];

  packetSignalStrength[quadIndex] = dataLSB | (dataMSB << 8);
}