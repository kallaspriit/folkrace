#include "RoboClaw.hpp"

#include <stdarg.h>

#define MAXTRY 1
#define SetDWORDval(arg) (uint8_t)(arg >> 24), (uint8_t)(arg >> 16), (uint8_t)(arg >> 8), (uint8_t)arg
#define SetWORDval(arg) (uint8_t)(arg >> 8), (uint8_t)arg

RoboClaw::RoboClaw(uint8_t adr, int baudrate, PinName rx, PinName tx) : serial(tx, rx)
{
  serial.baud(baudrate);
  address = adr;
}

void RoboClaw::clearCrc()
{
  crc = 0;
}

void RoboClaw::updateCrc(uint8_t data)
{
  int i;
  crc = crc ^ ((uint16_t)data << 8);
  for (i = 0; i < 8; i++)
  {
    if (crc & 0x8000)
      crc = (crc << 1) ^ 0x1021;
    else
      crc <<= 1;
  }
}

uint16_t RoboClaw::getCrc()
{
  return crc;
}

void RoboClaw::write(uint8_t cnt, ...)
{
  //uint8_t retry = MAXTRY;
  //do {
  clearCrc();
  va_list marker;
  va_start(marker, cnt);
  for (uint8_t index = 0; index < cnt; index++)
  {
    uint8_t data = va_arg(marker, unsigned int);
    updateCrc(data);
    serial.putc(data);
  }
  va_end(marker);
  uint16_t crc = getCrc();
  serial.putc(crc >> 8);
  serial.putc(crc);
  //} while(serial.getc() != 0xFF);
}

void RoboClaw::writeCommand(uint8_t command, uint8_t data, bool reading, bool crcon)
{
  serial.putc(address);
  serial.putc(command);

  if (reading == false)
  {
    if (crcon == true)
    {
      uint8_t packet[2] = {address, command};
      uint16_t checksum = crc16(packet, 2);
      serial.putc(checksum >> 8);
      serial.putc(checksum);
    }
    else
    {
      uint8_t packet[3] = {address, command, data};
      uint16_t checksum = crc16(packet, 3);
      serial.putc(data);
      serial.putc(checksum >> 8);
      serial.putc(checksum);
    }
  }
}

uint16_t RoboClaw::crc16(uint8_t *packet, int nBytes)
{
  uint16_t crc_ = 0;
  for (int byte = 0; byte < nBytes; byte++)
  {
    crc_ = crc_ ^ ((uint16_t)packet[byte] << 8);
    for (uint8_t bit = 0; bit < 8; bit++)
    {
      if (crc_ & 0x8000)
      {
        crc_ = (crc_ << 1) ^ 0x1021;
      }
      else
      {
        crc_ = crc_ << 1;
      }
    }
  }
  return crc_;
}

void RoboClaw::forwardM1(int speed)
{
  writeCommand(M1FORWARD, speed, false, false);
}

void RoboClaw::backwardM1(int speed)
{
  writeCommand(M1BACKWARD, speed, false, false);
}

void RoboClaw::forwardM2(int speed)
{
  writeCommand(M2FORWARD, speed, false, false);
}

void RoboClaw::backwardM2(int speed)
{
  writeCommand(M2BACKWARD, speed, false, false);
}

void RoboClaw::forward(int speed)
{
  writeCommand(MIXEDFORWARD, speed, false, false);
}

void RoboClaw::backward(int speed)
{
  writeCommand(MIXEDBACKWARD, speed, false, false);
}

// int32_t RoboClaw::getEncoderDeltaM1()
// {
//   uint16_t read_byte[7];
//   write(2, address, GETM1ENC);

//   read_byte[0] = (uint16_t)serial.getc();
//   read_byte[1] = (uint16_t)serial.getc();
//   read_byte[2] = (uint16_t)serial.getc();
//   read_byte[3] = (uint16_t)serial.getc();
//   read_byte[4] = (uint16_t)serial.getc();
//   read_byte[5] = (uint16_t)serial.getc();
//   read_byte[6] = (uint16_t)serial.getc();

//   int32_t enc1;

//   enc1 = read_byte[1] << 24;
//   enc1 |= read_byte[2] << 16;
//   enc1 |= read_byte[3] << 8;
//   enc1 |= read_byte[4];

//   // int32_t enc1 = (read_byte[3] << 24) | (read_byte[2] << 16) | (read_byte[1] << 8) | read_byte[0];

//   // printf("ENC  %lu\n", enc1);

//   return enc1;
// }

uint32_t RoboClaw::getEncoderDeltaM1(uint8_t *status, bool *valid)
{
  return read4_1(address, GETM1ENC, status, valid);
}

uint32_t RoboClaw::getEncoderDeltaM2(uint8_t *status, bool *valid)
{
  return read4_1(address, GETM2ENC, status, valid);
}

float RoboClaw::getMainBatteryVoltage(bool *valid)
{
  uint16_t value = read2(address, GETMBATT, valid);

  if (!valid)
  {
    return 0.0f;
  }

  return (float)value / 10.0f;
}

CurrentMeasurement RoboClaw::getCurrents()
{
  int16_t currentM1 = 0;
  int16_t currentM2 = 0;
  bool valid;

  uint32_t value = read4(address, GETCURRENTS, &valid);

  if (valid)
  {
    currentM1 = value >> 16;
    currentM2 = value & 0xFFFF;
  }

  return CurrentMeasurement(valid, (float)currentM1 / 100.0f, (float)currentM2 / 100.0f);
}

void RoboClaw::flush()
{
  while (serial.readable())
  {
    serial.getc();
  }

  return;
}

uint32_t RoboClaw::read4_1(uint8_t address, uint8_t cmd, uint8_t *status, bool *valid)
{
  // uint8_t crc;

  if (valid)
  {
    *valid = false;
  }

  uint32_t value = 0;
  uint8_t trys = MAXRETRY;
  int16_t data;

  do
  {
    flush();

    clearCrc();
    serial.putc(address);
    updateCrc(address);
    serial.putc(cmd);
    updateCrc(cmd);

    data = read();
    updateCrc(data);
    value = (uint32_t)data << 24;

    if (data != -1)
    {
      data = read();
      updateCrc(data);
      value |= (uint32_t)data << 16;
    }

    if (data != -1)
    {
      data = read();
      updateCrc(data);
      value |= (uint32_t)data << 8;
    }

    if (data != -1)
    {
      data = read();
      updateCrc(data);
      value |= (uint32_t)data;
    }

    if (data != -1)
    {
      data = read();
      updateCrc(data);
      if (status)
        *status = data;
    }

    // printf("value before crc %lu\n", value);

    if (data != -1)
    {
      uint16_t ccrc;
      data = read();
      if (data != -1)
      {
        ccrc = data << 8;
        data = read();
        if (data != -1)
        {
          ccrc |= data;
          if (getCrc() == ccrc)
          {
            *valid = true;
            return value;
          }
        }
      }
    }

    // printf("@ RoboClaw read4_1 #%u failed, trying again\n", cmd);
  } while (trys--);

  printf("@ RoboClaw read4_1 command %u failed after %d retries\n", cmd, MAXRETRY);

  return false;
}

// uint32_t RoboClaw::read4_1(uint8_t address, uint8_t cmd, uint8_t *status, bool *valid){
// 	// uint8_t crc;

// 	if(valid)
// 		*valid = false;

// 	uint32_t value=0;
// 	// uint8_t trys=MAXRETRY;
// 	uint8_t trys=2;
//   // uint32_t timeout = 10000;
// 	int16_t data;
// 	do{
// 		flush();

// 		clearCrc();
// 		write(address);
// 		updateCrc(address);
// 		write(cmd);
// 		updateCrc(cmd);

// 		data = read();
// 		updateCrc(data);
// 		value=(uint32_t)data<<24;

// 		if(data!=-1){
// 			data = read();
// 			updateCrc(data);
// 			value|=(uint32_t)data<<16;
// 		}

// 		if(data!=-1){
// 			data = read();
// 			updateCrc(data);
// 			value|=(uint32_t)data<<8;
// 		}

// 		if(data!=-1){
// 			data = read();
// 			updateCrc(data);
// 			value|=(uint32_t)data;
// 		}

// 		if(data!=-1){
// 			data = read();
// 			updateCrc(data);
// 			if(status)
// 				*status = data;
// 		}

// 		if(data!=-1){
// 			uint16_t ccrc;
// 			data = read();
// 			if(data!=-1){
// 				ccrc = data << 8;
// 				data = read();
// 				if(data!=-1){
// 					ccrc |= data;
// 					if(getCrc()==ccrc){
// 						if(valid)
// 							*valid = true;
// 						return value;
// 					}
// 				}
// 			}
// 		}
// 	}while(trys--);

//   printf("@ RoboClaw read4_1 #%u failed\n", cmd);

// 	return false;
// }

uint32_t RoboClaw::read4(uint8_t address, uint8_t cmd, bool *valid)
{
  // uint8_t crc;

  if (valid)
    *valid = false;

  uint32_t value = 0;
  // uint8_t trys = MAXRETRY;
  // uint8_t trys = 2;
  int16_t data;
  // do
  // {
  flush();

  clearCrc();
  serial.putc(address);
  updateCrc(address);
  serial.putc(cmd);
  updateCrc(cmd);

  data = read();
  updateCrc(data);
  value = (uint32_t)data << 24;

  if (data != -1)
  {
    data = read();
    updateCrc(data);
    value |= (uint32_t)data << 16;
  }

  if (data != -1)
  {
    data = read();
    updateCrc(data);
    value |= (uint32_t)data << 8;
  }

  if (data != -1)
  {
    data = read();
    updateCrc(data);
    value |= (uint32_t)data;
  }

  if (data != -1)
  {
    uint16_t ccrc;
    data = read();
    if (data != -1)
    {
      ccrc = data << 8;
      data = read();
      if (data != -1)
      {
        ccrc |= data;
        if (getCrc() == ccrc)
        {
          *valid = true;
          return value;
        }
      }
    }
  }
  // } while (trys--);

  return false;
}

uint16_t RoboClaw::read2(uint8_t address, uint8_t cmd, bool *valid)
{
  // uint8_t crc;

  if (valid)
  {
    *valid = false;
  }

  uint16_t value = 0;
  // uint8_t trys = MAXRETRY;
  // uint8_t trys = 2;
  int16_t data;
  // do
  // {
  flush();

  clearCrc();
  serial.putc(address);
  updateCrc(address);
  serial.putc(cmd);
  updateCrc(cmd);

  data = read();
  updateCrc(data);
  value = (uint16_t)data << 8;

  if (data != -1)
  {
    data = read();
    updateCrc(data);
    value |= (uint16_t)data;
  }

  if (data != -1)
  {
    uint16_t ccrc;
    data = read();
    if (data != -1)
    {
      ccrc = data << 8;
      data = read();
      if (data != -1)
      {
        ccrc |= data;
        if (getCrc() == ccrc)
        {
          *valid = true;
          return value;
        }
      }
    }
  }

  printf("@ RoboClaw read2 #%u failed\n", cmd);
  // } while (trys--);

  return false;
}

uint16_t RoboClaw::read(int timeoutUs)
{
  // Timer timer;
  readTimer.reset();
  readTimer.start();

  int cycles = 0;

  while (!serial.readable())
  {
    cycles++;

    int waitedTimeUs = readTimer.read_us();

    if (waitedTimeUs >= timeoutUs)
    {
      printf("@ RoboClaw read gave up after %d/%d us (%d cycles)\n", waitedTimeUs, timeoutUs, cycles);

      return -1;
    }
  }

  if (cycles > 0)
  {
    // int waitedTimeUs = readTimer.read_us();

    // printf("# RoboClaw read waited for %d/%d us (%d cycles)\n", waitedTimeUs, timeoutUs, cycles);
  }

  return (uint16_t)serial.getc();
}

// uint32_t RoboClaw::read4_1(uint8_t address, uint8_t cmd, uint8_t *status, bool *valid)
// {
//   if (valid)
//     *valid = false;

//   uint16_t value = 0;
//   uint8_t trys = 2;
//   int16_t data;
//   do
//   {
//     // flush();
//     // serial.flush();

//     clearCrc();
//     // serial.putc(address);
//     serial.putc(address);
//     updateCrc(address);
//     // write(cmd);
//     serial.putc(cmd);
//     updateCrc(cmd);

//     data = (uint16_t)serial.getc();
//     updateCrc(data);
//     value = (uint16_t)data << 24;

//     if (data != -1)
//     {
//       data = (uint16_t)serial.getc();
//       updateCrc(data);
//       value = (uint16_t)data << 16;
//     }

//     if (data != -1)
//     {
//       data = (uint16_t)serial.getc();
//       updateCrc(data);
//       value = (uint16_t)data << 8;
//     }

//     if (data != -1)
//     {
//       data = (uint16_t)serial.getc();
//       updateCrc(data);
//       value |= (uint16_t)data;
//     }

//     if (data != -1)
//     {
//       data = (uint16_t)serial.getc();
//       updateCrc(data);
//       if (status)
//         *status = data;
//     }

//     if (data != -1)
//     {
//       uint16_t ccrc;
//       data = (uint16_t)serial.getc();
//       if (data != -1)
//       {
//         ccrc = data << 8;
//         data = (uint16_t)serial.getc();
//         if (data != -1)
//         {
//           ccrc |= data;
//           if (getCrc() == ccrc)
//           {
//             *valid = true;
//             return value;
//           }
//         }
//       }
//     }
//   } while (trys--);

//   return false;
// }

// int32_t RoboClaw::getEncoderDeltaM2()
// {
//   int32_t enc2;
//   uint16_t read_byte2[7];
//   writeCommand(GETM2ENC, 0x00, true, false);

//   read_byte2[0] = (uint16_t)serial.getc();
//   read_byte2[1] = (uint16_t)serial.getc();
//   read_byte2[2] = (uint16_t)serial.getc();
//   read_byte2[3] = (uint16_t)serial.getc();
//   read_byte2[4] = (uint16_t)serial.getc();
//   read_byte2[5] = (uint16_t)serial.getc();
//   read_byte2[6] = (uint16_t)serial.getc();

//   enc2 = read_byte2[1] << 24;
//   enc2 |= read_byte2[2] << 16;
//   enc2 |= read_byte2[3] << 8;
//   enc2 |= read_byte2[4];

//   return enc2;
// }

int32_t RoboClaw::getSpeedM1()
{
  int32_t speed1;
  uint16_t read_byte[7];
  write(2, address, GETM1SPEED);

  read_byte[0] = (uint16_t)serial.getc();
  read_byte[1] = (uint16_t)serial.getc();
  read_byte[2] = (uint16_t)serial.getc();
  read_byte[3] = (uint16_t)serial.getc();
  read_byte[4] = (uint16_t)serial.getc();
  read_byte[5] = (uint16_t)serial.getc();
  read_byte[6] = (uint16_t)serial.getc();

  speed1 = read_byte[1] << 24;
  speed1 |= read_byte[2] << 16;
  speed1 |= read_byte[3] << 8;
  speed1 |= read_byte[4];

  return speed1;
}

int32_t RoboClaw::getSpeedM2()
{
  int32_t speed2;
  uint16_t read_byte2[7];
  write(2, address, GETM2SPEED);

  read_byte2[0] = (uint16_t)serial.getc();
  read_byte2[1] = (uint16_t)serial.getc();
  read_byte2[2] = (uint16_t)serial.getc();
  read_byte2[3] = (uint16_t)serial.getc();
  read_byte2[4] = (uint16_t)serial.getc();
  read_byte2[5] = (uint16_t)serial.getc();
  read_byte2[6] = (uint16_t)serial.getc();

  speed2 = read_byte2[1] << 24;
  speed2 |= read_byte2[2] << 16;
  speed2 |= read_byte2[3] << 8;
  speed2 |= read_byte2[4];

  return speed2;
}

void RoboClaw::resetEncoders()
{
  write(2, address, RESETENC);
}

void RoboClaw::setSpeedM1(int32_t speed)
{
  write(6, address, M1SPEED, SetDWORDval(speed));
}

void RoboClaw::setSpeedM2(int32_t speed)
{
  write(6, address, M2SPEED, SetDWORDval(speed));
}

void RoboClaw::setSpeedAccelerationM1(int32_t accel, int32_t speed)
{
  write(10, address, M1SPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed));
}

void RoboClaw::setSpeedAccelerationM2(int32_t accel, int32_t speed)
{
  write(10, address, M2SPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed));
}

void RoboClaw::setSpeedAccelerationM1M2(int32_t accel, int32_t speed1, int32_t speed2)
{
  write(14, address, MIXEDSPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed1), SetDWORDval(speed2));
}

void RoboClaw::setSpeedDistanceM1(int32_t speed, uint32_t distance, uint8_t buffer)
{
  write(11, address, M1SPEEDDIST, SetDWORDval(speed), SetDWORDval(distance), buffer);
}

void RoboClaw::setSpeedDistanceM2(int32_t speed, uint32_t distance, uint8_t buffer)
{
  write(11, address, M2SPEEDDIST, SetDWORDval(speed), SetDWORDval(distance), buffer);
}

void RoboClaw::setSpeedAccelerationDistanceM1(int32_t accel, int32_t speed, uint32_t distance, uint8_t buffer)
{
  write(15, address, M1SPEEDACCELDIST, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(distance), buffer);
}

void RoboClaw::setSpeedAccelerationDistanceM2(int32_t accel, int32_t speed, uint32_t distance, uint8_t buffer)
{
  write(15, address, M2SPEEDACCELDIST, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(distance), buffer);
}

void RoboClaw::setSpeedAccelerationDeaccelerationPositionM1(uint32_t accel, int32_t speed, uint32_t deccel, int32_t position, uint8_t flag)
{
  write(19, address, M1SPEEDACCELDECCELPOS, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(deccel), SetDWORDval(position), flag);
}

void RoboClaw::setSpeedAccelerationDeaccelerationPositionM2(uint32_t accel, int32_t speed, uint32_t deccel, int32_t position, uint8_t flag)
{
  write(19, address, M2SPEEDACCELDECCELPOS, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(deccel), SetDWORDval(position), flag);
}

void RoboClaw::setSpeedAccelerationDeaccelerationPositionM1M2(uint32_t accel1, uint32_t speed1, uint32_t deccel1, int32_t position1, uint32_t accel2, uint32_t speed2, uint32_t deccel2, int32_t position2, uint8_t flag)
{
  write(35, address, MIXEDSPEEDACCELDECCELPOS, SetDWORDval(accel1), SetDWORDval(speed1), SetDWORDval(deccel1), SetDWORDval(position1), SetDWORDval(accel2), SetDWORDval(speed2), SetDWORDval(deccel2), SetDWORDval(position2), flag);
}
