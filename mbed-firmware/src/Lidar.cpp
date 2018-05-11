#include "Lidar.hpp"

#include <mbed.h>
#include <Callback.h>

Lidar::Lidar(PinName tx, PinName rx, PinName motor_pwm) : _lidar(tx, rx), _motor(motor_pwm)
{
  _lidar.baud(115200);
  _motor.period_us(100);
  _motor.write(0.0);

  _data_ptr = (char *)_data;
  _speed_ptr = (char *)&_speed;

  _fsm_state = 0;
  _fsm_count = 0;

  _speed = 0;
  for (int i = 0; i < 360; i++)
    _data[i] = 0;
}

void Lidar::update()
{
  while (_lidar.readable())
  {
    handleSerialRx();
  }
}

void Lidar::StartData(void)
{
  // _lidar.attach(this, &Lidar::data_parser, Serial::RxIrq);
  // _lidar.attach(callback(this, &Lidar::data_parser), Serial::RxIrq);
  _lidar.attach(callback(this, &Lidar::handleSerialRx), Serial::RxIrq);
}

void Lidar::StopData(void)
{
  _lidar.attach(NULL, Serial::RxIrq);
}

void Lidar::SetPWMDuty(float duty)
{
  _motor.write(duty);

  pwm_val = duty;
}

void Lidar::SetPWMPeriodUs(int microseconds)
{
  _motor.period_us(microseconds);
}

float Lidar::GetData(int degree)
{
  if (degree < 360 && degree >= 0)
    return _data[degree] / 10.0;
  else
    return -1.0;
}

float Lidar::getRpm()
{
  return motor_rpm;
}

void Lidar::handleSerialRx()
{
  uint8_t inByte = _lidar.getc();
  ; // get incoming byte:

  // Switch, based on 'eState':
  // State 1: We're scanning for 0xFA (COMMAND) in the input stream
  // State 2: Build a complete data packet
  if (eState == eState_Find_COMMAND)
  { // flush input until we get COMMAND byte
    if (inByte == COMMAND)
    {
      eState++;                    // switch to 'build a packet' state
      Packet[ixPacket++] = inByte; // store 1st byte of data into 'Packet'
    }
  }
  else
  {                              // eState == eState_Build_Packet
    Packet[ixPacket++] = inByte; // keep storing input into 'Packet'
    if (ixPacket == PACKET_LENGTH)
    { // we've got all the input bytes, so we're done building this packet
      if (eValidatePacket() == VALID_PACKET)
      {                                 // Check packet CRC
        startingAngle = processIndex(); // get the starting angle of this group (of 4), e.g., 0, 4, 8, 12, ...
        processSpeed();                 // process the speed
        // process each of the (4) sets of data in the packet
        for (int ix = 0; ix < N_DATA_QUADS; ix++) // process the distance
          aryInvalidDataFlag[ix] = processDistance(ix);
        for (int ix = 0; ix < N_DATA_QUADS; ix++)
        { // process the signal strength (quality)
          aryQuality[ix] = 0;
          if (aryInvalidDataFlag[ix] == 0)
            processSignalStrength(ix);
        }
        if (show_dist)
        { // the 'ShowDistance' command is active
          for (int ix = 0; ix < N_DATA_QUADS; ix++)
          {
            bool isBadData = aryInvalidDataFlag[ix] & BAD_DATA_MASK;
            bool isInvalidData = isBadData && aryInvalidDataFlag[ix] & INVALID_DATA_FLAG;
            bool isPoorSignalStrength = isBadData && aryInvalidDataFlag[ix] & STRENGTH_WARNING_FLAG;
            int distance = int(aryDist[ix]);
            int quality = aryQuality[ix];

            printf("lidar:%d:%d:%d:%d:%d\n", startingAngle + ix, isInvalidData ? 0 : 1, isPoorSignalStrength ? 0 : 1, distance, quality);
            // printf("l:%d:%d:%d\n", startingAngle + ix, distance, quality);

            // } // if (xv_config.aryAngles[startingAngle + ix])
          } // for (int ix = 0; ix < N_DATA_QUADS; ix++)
        }   // if (xv_config.show_dist)
      }     // if (eValidatePacket() == 0
      else if (show_errors)
      {
        // we have encountered a CRC error
        printf("# got lidar CRC error\n");
      }
      // initialize a bunch of stuff before we switch back to State 1
      for (int ix = 0; ix < N_DATA_QUADS; ix++)
      {
        aryDist[ix] = 0;
        aryQuality[ix] = 0;
        aryInvalidDataFlag[ix] = 0;
      }
      for (ixPacket = 0; ixPacket < PACKET_LENGTH; ixPacket++) // clear out this packet
        Packet[ixPacket] = 0;
      ixPacket = 0;
      eState = eState_Find_COMMAND; // This packet is done -- look for next COMMAND byte
    }                               // if (ixPacket == PACKET_LENGTH)
  }                                 // if (eState == eState_Find_COMMAND)
}

uint8_t Lidar::eValidatePacket()
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
    CalcCRC[ix / 2] = Packet[ix] + ((Packet[ix + 1]) << 8);

  chk32 = 0;
  for (ix = 0; ix < CalcCRC_Len; ix++)
    chk32 = (chk32 << 1) + CalcCRC[ix];
  checksum = (chk32 & 0x7FFF) + (chk32 >> 15);
  checksum &= 0x7FFF;
  b1a = checksum & 0xFF;
  b1b = Packet[OFFSET_TO_CRC_L];
  b2a = checksum >> 8;
  b2b = Packet[OFFSET_TO_CRC_M];
  if ((b1a == b1b) && (b2a == b2b))
    return VALID_PACKET; // okay
  else
    return INVALID_PACKET; // non-zero = bad CRC
}

uint16_t Lidar::processIndex()
{
  uint16_t angle = 0;
  uint16_t data_4deg_index = Packet[OFFSET_TO_INDEX] - INDEX_LO;
  angle = data_4deg_index * N_DATA_QUADS; // 1st angle in the set of 4
  if (angle == 0)
  {
    if (ledState)
    {
      ledState = 0;
    }
    else
    {
      ledState = 1;
    }
    // digitalWrite(ledPin, ledState);

    if (show_rpm)
    {
      printf("rpm:%f:%f\n", motor_rpm, pwm_val);
    }

    // curMillis = millis();
    // if (xv_config.show_interval)
    // {
    //   Serial.print(F("T,")); // Time Interval in ms since last complete revolution
    //   Serial.println(curMillis - lastMillis);
    // }
    // lastMillis = curMillis;

  } // if (angle == 0)
  return angle;
}

void Lidar::processSpeed()
{
  motor_rph_low_byte = Packet[OFFSET_TO_SPEED_LSB];
  motor_rph_high_byte = Packet[OFFSET_TO_SPEED_MSB];
  motor_rph = (motor_rph_high_byte << 8) | motor_rph_low_byte;
  motor_rpm = float((motor_rph_high_byte << 8) | motor_rph_low_byte) / 64.0;
}

uint8_t Lidar::processDistance(int iQuad)
{
  uint8_t dataL, dataM;
  aryDist[iQuad] = 0; // initialize
  int iOffset = OFFSET_TO_4_DATA_READINGS + (iQuad * N_DATA_QUADS) + OFFSET_DATA_DISTANCE_LSB;
  // byte 0 : <distance 7:0> (LSB)
  // byte 1 : <"invalid data" flag> <"strength warning" flag> <distance 13:8> (MSB)
  dataM = Packet[iOffset + 1];    // get MSB of distance data + flags
  if (dataM & BAD_DATA_MASK)      // if either INVALID_DATA_FLAG or STRENGTH_WARNING_FLAG is set...
    return dataM & BAD_DATA_MASK; // ...then return non-zero
  dataL = Packet[iOffset];        // LSB of distance data
  aryDist[iQuad] = dataL | ((dataM & 0x3F) << 8);
  return 0; // okay
}

void Lidar::processSignalStrength(int iQuad)
{
  uint8_t dataL, dataM;
  aryQuality[iQuad] = 0; // initialize
  int iOffset = OFFSET_TO_4_DATA_READINGS + (iQuad * N_DATA_QUADS) + OFFSET_DATA_SIGNAL_LSB;
  dataL = Packet[iOffset]; // signal strength LSB
  dataM = Packet[iOffset + 1];
  aryQuality[iQuad] = dataL | (dataM << 8);
}

// void Lidar::data_parser(void)
// {
//   char buffer;

//   // Insert data to temporary buffer
//   buffer = _lidar.getc();

//   // State machine for data extraction
//   switch (_fsm_state)
//   {
//   case 0:
//     // If start byte found, move to next state
//     if (buffer == 0xFA)
//     {
//       _fsm_count = 0;
//       _fsm_state++;
//     }
//     break;

//   case 1:
//     // Determine the packet number and check packet validity
//     _fsm_angle = (buffer - 0xA0) << 3;
//     if (_fsm_angle <= 712)
//       _fsm_state++;
//     else
//       _fsm_state = 0;
//     break;

//   case 2:
//     // Add the LSB of RPM
//     _speed_ptr[0] = buffer;
//     _fsm_state++;
//     break;

//   case 3:
//     // Add the MSB of RPM
//     _speed_ptr[1] = buffer;
//     _fsm_state++;
//     break;

//   case 4:
//     // Add the LSB of distance
//     _data_ptr[718 - _fsm_angle] = buffer;
//     _fsm_state++;
//     break;

//   case 5:
//     // Add the MSB of distance and check packet validity
//     if (buffer & 0x80)
//     {
//       // Invalid packet is marked by -1
//       _data[359 - (_fsm_angle >> 1)] = -1;
//     }
//     else
//     {
//       _data_ptr[719 - _fsm_angle] = buffer & 0x3F;
//     }
//     _fsm_state++;
//     break;

//   case 6:
//     // Increment packet counter and angle
//     _fsm_count++;
//     _fsm_angle += 2;
//     _fsm_state++;
//     break;

//   case 7:
//     // Check number of data accquired
//     // 1 packet should contains 4 data
//     if (_fsm_count < 4)
//       _fsm_state = 4;
//     else
//     {
//       _fsm_state = 0;
//     }
//     break;

//   default:
//     _fsm_state = 0;
//   }
// }