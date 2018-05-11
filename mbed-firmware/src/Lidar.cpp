#include "Lidar.hpp"

#include <mbed.h>
#include <Callback.h>

Lidar::Lidar(PinName txPin, PinName rxPin, PinName motorPwmPin) : serial(txPin, rxPin, 115200), motorPwm(motorPwmPin)
{
  // stop the motor initially
  motorPwm.period_us(100);
  motorPwm.write(0.0);

  // start the timer
  cycleTimer.start();
}

void Lidar::start(int targetMotorRpm)
{
  // always update the target rpm
  setMotorTargetRpm(targetMotorRpm);

  // ignore if already running
  if (isRunning)
  {
    return;
  }

  // start the cycle timer that gets reset after each rotation
  cycleTimer.start();

  isRunning = true;

  // listen for serial data
  // serial.attach(callback(this, &Lidar::handleSerialRx), Serial::RxIrq);
}

void Lidar::stop()
{
  // ignore if not running
  if (!isRunning)
  {
    return;
  }

  // stop listening for serial data
  // serial.attach(NULL, Serial::RxIrq);

  isRunning = false;
}

bool Lidar::isStarted()
{
  return isRunning;
}

bool Lidar::isValid()
{
  if (!isRunning)
  {
    return false;
  }

  // get time since last cycle and calculate expected
  int timeSinceLastCycle = cycleTimer.read_ms();

  // consider invalid if the last cycle has taken too long
  if (timeSinceLastCycle > expectedCycleDuration * 1.2)
  {
    return false;
  }

  return true;
}

void Lidar::update()
{
  while (serial.readable())
  {
    handleSerialRx();
  }
}

void Lidar::setMotorPwm(float duty)
{
  motorPwm.write(duty);

  motorPwmDuty = duty;
}

void Lidar::setMotorTargetRpm(int newTargetMotorRpm)
{
  targetMotorRpm = newTargetMotorRpm;
  expectedCycleDuration = 1000 / (targetMotorRpm / 60);

  // TODO: implement real speed controller
  setMotorPwm((float)newTargetMotorRpm / 300.0f * 0.7f);
}

int Lidar::getMotorRpm()
{
  // return zero if not valid
  if (!isValid())
  {
    return 0;
  }

  return lastMotorRpm;
}

void Lidar::handleSerialRx()
{
  // read next byte
  uint8_t inByte = serial.getc();

  // execute the state machine
  switch (state)
  {
  case WAITING_FOR_START_BYTE:
    processWaitingForStartByte(inByte);
    break;

  case BUILDING_PACKET:
    processBuildPacket(inByte);
    break;
  }
}

void Lidar::processWaitingForStartByte(uint8_t inByte)
{
  // ignore characters not matching the start byte
  if (inByte != PACKET_START_BYTE)
  {
    return;
  }

  // move to building packet state and store the byte
  state = BUILDING_PACKET;
  packet[packetByteIndex++] = inByte;
}

void Lidar::processBuildPacket(uint8_t inByte)
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
  wasLastPacketValid = isPacketValid();

  // we've got all the input bytes, so we're done building this packet
  if (wasLastPacketValid)
  {
    // get the starting angle of this group (of 4), e.g., 0, 4, 8, 12, ...
    packetStartAngle = processIndex();

    // process motor rpm info
    processRpm();

    // process distances
    for (int ix = 0; ix < N_DATA_QUADS; ix++)
    {
      packetInvalidFlag[ix] = processDistance(ix);
    }

    // process the signal strength (quality)
    for (int ix = 0; ix < N_DATA_QUADS; ix++)
    {
      packetSignalStrength[ix] = 0;

      // process signal strength if not invalid
      if (packetInvalidFlag[ix] == 0)
      {
        processSignalStrength(ix);
      }
    }

    // TODO: queue the measurements?
    // if (showDistances)
    // { // the 'ShowDistance' command is active
    //   for (int ix = 0; ix < N_DATA_QUADS; ix++)
    //   {
    //     bool isBadData = packetInvalidFlag[ix] & BAD_DATA_MASK;
    //     bool isInvalidData = isBadData && packetInvalidFlag[ix] & INVALID_DATA_FLAG;
    //     bool isPoorSignalStrength = isBadData && packetInvalidFlag[ix] & STRENGTH_WARNING_FLAG;
    //     int distance = int(packetDistance[ix]);
    //     int quality = packetSignalStrength[ix];

    //     printf("lidar:%d:%d:%d:%d:%d\n", packetStartAngle + ix, isInvalidData ? 0 : 1, isPoorSignalStrength ? 0 : 1, distance, quality);
    //     // printf("l:%d:%d:%d\n", packetStartAngle + ix, distance, quality);

    //     // } // if (xv_config.aryAngles[packetStartAngle + ix])
    //   }
    // }
  }

  resetPacket();
}

void Lidar::resetPacket()
{
  // reset data and metrics
  for (int ix = 0; ix < N_DATA_QUADS; ix++)
  {
    packetDistance[ix] = 0;
    packetSignalStrength[ix] = 0;
    packetInvalidFlag[ix] = 0;
  }

  // clear out packet contents
  for (packetByteIndex = 0; packetByteIndex < PACKET_LENGTH; packetByteIndex++)
  {
    packet[packetByteIndex] = 0;
  }

  // reset packet byte index
  packetByteIndex = 0;

  // go back to waiting for start byte packet
  state = WAITING_FOR_START_BYTE;
}

bool Lidar::isPacketValid()
{
  unsigned long chk32;
  unsigned long checksum;
  const int bytesToCheck = PACKET_LENGTH - 2;
  const int CalcCRC_Len = bytesToCheck / 2;
  unsigned int CalcCRC[CalcCRC_Len];

  uint8_t b1a, b1b, b2a, b2b;
  int ix;

  for (int ix = 0; ix < CalcCRC_Len; ix++) // initialize 'CalcCRC' array
    CalcCRC[ix] = 0;

  // Perform checksum validity test
  for (ix = 0; ix < bytesToCheck; ix += 2) // build 'CalcCRC' array
    CalcCRC[ix / 2] = packet[ix] + ((packet[ix + 1]) << 8);

  chk32 = 0;
  for (ix = 0; ix < CalcCRC_Len; ix++)
    chk32 = (chk32 << 1) + CalcCRC[ix];
  checksum = (chk32 & 0x7FFF) + (chk32 >> 15);
  checksum &= 0x7FFF;
  b1a = checksum & 0xFF;
  b1b = packet[OFFSET_TO_CRC_L];
  b2a = checksum >> 8;
  b2b = packet[OFFSET_TO_CRC_M];
  if ((b1a == b1b) && (b2a == b2b))
    return true; // okay
  else
    return false; // non-zero = bad CRC
}

uint16_t Lidar::processIndex()
{
  uint16_t angle = 0;
  uint16_t data_4deg_index = packet[OFFSET_TO_INDEX] - INDEX_LO;

  angle = data_4deg_index * N_DATA_QUADS; // 1st angle in the set of 4

  if (angle == 0)
  {
    // rotation was made, reset the cycle timer
    cycleTimer.reset();
  }

  return angle;
}

void Lidar::processRpm()
{
  uint8_t motor_rph_low_byte = packet[OFFSET_TO_SPEED_LSB];
  uint8_t motor_rph_high_byte = packet[OFFSET_TO_SPEED_MSB];

  lastMotorRpm = int(float((motor_rph_high_byte << 8) | motor_rph_low_byte) / 64.0f);
}

uint8_t Lidar::processDistance(int iQuad)
{
  uint8_t dataL, dataM;
  packetDistance[iQuad] = 0; // initialize
  int iOffset = OFFSET_TO_4_DATA_READINGS + (iQuad * N_DATA_QUADS) + OFFSET_DATA_DISTANCE_LSB;
  // byte 0 : <distance 7:0> (LSB)
  // byte 1 : <"invalid data" flag> <"strength warning" flag> <distance 13:8> (MSB)
  dataM = packet[iOffset + 1];    // get MSB of distance data + flags
  if (dataM & BAD_DATA_MASK)      // if either INVALID_DATA_FLAG or STRENGTH_WARNING_FLAG is set...
    return dataM & BAD_DATA_MASK; // ...then return non-zero
  dataL = packet[iOffset];        // LSB of distance data
  packetDistance[iQuad] = dataL | ((dataM & 0x3F) << 8);
  return 0; // okay
}

void Lidar::processSignalStrength(int iQuad)
{
  uint8_t dataL, dataM;
  packetSignalStrength[iQuad] = 0; // initialize
  int iOffset = OFFSET_TO_4_DATA_READINGS + (iQuad * N_DATA_QUADS) + OFFSET_DATA_SIGNAL_LSB;
  dataL = packet[iOffset]; // signal strength LSB
  dataM = packet[iOffset + 1];
  packetSignalStrength[iQuad] = dataL | (dataM << 8);
}