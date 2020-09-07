#include "MotorController.hpp"

#include <stdarg.h>

#define MAXTRY 1
#define SetDWORDval(arg) (uint8_t)(arg >> 24), (uint8_t)(arg >> 16), (uint8_t)(arg >> 8), (uint8_t)arg
#define SetWORDval(arg) (uint8_t)(arg >> 8), (uint8_t)arg

MotorController::MotorController(uint8_t adr, int baudrate, PinName rx, PinName tx) : _serial(tx, rx)
{
    _serial.baud(baudrate);

    address = adr;
}

void MotorController::crc_clear()
{
    crc = 0;
}

void MotorController::crc_update(uint8_t data)
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

uint16_t MotorController::crc_get()
{
    return crc;
}

void MotorController::write_n(uint8_t cnt, ...)
{
    Flush();

    //uint8_t retry = MAXTRY;
    //do {
    crc_clear();
    va_list marker;
    va_start(marker, cnt);
    for (uint8_t index = 0; index < cnt; index++)
    {
        uint8_t data = va_arg(marker, unsigned int);
        crc_update(data);
        _serial.putc(data);
    }
    va_end(marker);
    uint16_t crc = crc_get();
    _serial.putc(crc >> 8);
    _serial.putc(crc);
    //} while(_serial.getc() != 0xFF);
}

void MotorController::write_(uint8_t command, uint8_t data, bool reading, bool crcon)
{
    _serial.putc(address);
    _serial.putc(command);

    if (reading == false)
    {
        if (crcon == true)
        {
            uint8_t packet[2] = {address, command};
            uint16_t checksum = crc16(packet, 2);
            _serial.putc(checksum >> 8);
            _serial.putc(checksum);
        }
        else
        {
            uint8_t packet[3] = {address, command, data};
            uint16_t checksum = crc16(packet, 3);
            _serial.putc(data);
            _serial.putc(checksum >> 8);
            _serial.putc(checksum);
        }
    }
}

uint16_t MotorController::crc16(uint8_t *packet, int nBytes)
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

uint8_t MotorController::read_(void)
{
    return (_serial.getc());
}

void MotorController::Flush()
{
    while (_serial.readable())
    {
        _serial.getc();
    }

    return;
}

void MotorController::ForwardM1(int speed)
{
    write_(M1FORWARD, speed, false, false);
}

void MotorController::BackwardM1(int speed)
{
    write_(M1BACKWARD, speed, false, false);
}

void MotorController::ForwardM2(int speed)
{
    write_(M2FORWARD, speed, false, false);
}

void MotorController::BackwardM2(int speed)
{
    write_(M2BACKWARD, speed, false, false);
}

void MotorController::Forward(int speed)
{
    write_(MIXEDFORWARD, speed, false, false);
}

void MotorController::Backward(int speed)
{
    write_(MIXEDBACKWARD, speed, false, false);
}

void MotorController::ReadFirm()
{
    write_(GETVERSION, 0x00, true, false);
}

int32_t MotorController::getEncoderDeltaM1()
{
    int32_t enc1;
    uint16_t read_byte[7];
    write_n(2, address, GETM1ENC);

    read_byte[0] = (uint16_t)_serial.getc();
    read_byte[1] = (uint16_t)_serial.getc();
    read_byte[2] = (uint16_t)_serial.getc();
    read_byte[3] = (uint16_t)_serial.getc();
    read_byte[4] = (uint16_t)_serial.getc();
    read_byte[5] = (uint16_t)_serial.getc();
    read_byte[6] = (uint16_t)_serial.getc();

    enc1 = read_byte[1] << 24;
    enc1 |= read_byte[2] << 16;
    enc1 |= read_byte[3] << 8;
    enc1 |= read_byte[4];

    return enc1;
}

int32_t MotorController::getEncoderDeltaM2()
{
    int32_t enc2;
    uint16_t read_byte2[7];
    write_(GETM2ENC, 0x00, true, false);

    read_byte2[0] = (uint16_t)_serial.getc();
    read_byte2[1] = (uint16_t)_serial.getc();
    read_byte2[2] = (uint16_t)_serial.getc();
    read_byte2[3] = (uint16_t)_serial.getc();
    read_byte2[4] = (uint16_t)_serial.getc();
    read_byte2[5] = (uint16_t)_serial.getc();
    read_byte2[6] = (uint16_t)_serial.getc();

    enc2 = read_byte2[1] << 24;
    enc2 |= read_byte2[2] << 16;
    enc2 |= read_byte2[3] << 8;
    enc2 |= read_byte2[4];

    return enc2;
}

int32_t MotorController::ReadSpeedM1()
{
    int32_t speed1;
    uint16_t read_byte[7];
    write_n(2, address, GETM1SPEED);

    read_byte[0] = (uint16_t)_serial.getc();
    read_byte[1] = (uint16_t)_serial.getc();
    read_byte[2] = (uint16_t)_serial.getc();
    read_byte[3] = (uint16_t)_serial.getc();
    read_byte[4] = (uint16_t)_serial.getc();
    read_byte[5] = (uint16_t)_serial.getc();
    read_byte[6] = (uint16_t)_serial.getc();

    speed1 = read_byte[1] << 24;
    speed1 |= read_byte[2] << 16;
    speed1 |= read_byte[3] << 8;
    speed1 |= read_byte[4];

    return speed1;
}

int32_t MotorController::ReadSpeedM2()
{
    int32_t speed2;
    uint16_t read_byte2[7];
    write_n(2, address, GETM2SPEED);

    read_byte2[0] = (uint16_t)_serial.getc();
    read_byte2[1] = (uint16_t)_serial.getc();
    read_byte2[2] = (uint16_t)_serial.getc();
    read_byte2[3] = (uint16_t)_serial.getc();
    read_byte2[4] = (uint16_t)_serial.getc();
    read_byte2[5] = (uint16_t)_serial.getc();
    read_byte2[6] = (uint16_t)_serial.getc();

    speed2 = read_byte2[1] << 24;
    speed2 |= read_byte2[2] << 16;
    speed2 |= read_byte2[3] << 8;
    speed2 |= read_byte2[4];

    return speed2;
}

void MotorController::ResetEnc()
{
    write_n(2, address, RESETENC);
}

void MotorController::setSpeedM1(int32_t speed)
{
    write_n(6, address, M1SPEED, SetDWORDval(speed));
}

void MotorController::setSpeedM2(int32_t speed)
{
    write_n(6, address, M2SPEED, SetDWORDval(speed));
}

void MotorController::SpeedAccelM1(int32_t accel, int32_t speed)
{
    write_n(10, address, M1SPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed));
}

void MotorController::SpeedAccelM2(int32_t accel, int32_t speed)
{
    write_n(10, address, M2SPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed));
}

void MotorController::SpeedAccelM1M2(int32_t accel, int32_t speed1, int32_t speed2)
{
    write_n(14, address, MIXEDSPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed1), SetDWORDval(speed2));
}

void MotorController::SpeedDistanceM1(int32_t speed, uint32_t distance, uint8_t buffer)
{
    write_n(11, address, M1SPEEDDIST, SetDWORDval(speed), SetDWORDval(distance), buffer);
}

void MotorController::SpeedDistanceM2(int32_t speed, uint32_t distance, uint8_t buffer)
{
    write_n(11, address, M2SPEEDDIST, SetDWORDval(speed), SetDWORDval(distance), buffer);
}

void MotorController::SpeedAccelDistanceM1(int32_t accel, int32_t speed, uint32_t distance, uint8_t buffer)
{
    write_n(15, address, M1SPEEDACCELDIST, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(distance), buffer);
}

void MotorController::SpeedAccelDistanceM2(int32_t accel, int32_t speed, uint32_t distance, uint8_t buffer)
{
    write_n(15, address, M2SPEEDACCELDIST, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(distance), buffer);
}

void MotorController::SpeedAccelDeccelPositionM1(uint32_t accel, int32_t speed, uint32_t deccel, int32_t position, uint8_t flag)
{
    write_n(19, address, M1SPEEDACCELDECCELPOS, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(deccel), SetDWORDval(position), flag);
}

void MotorController::SpeedAccelDeccelPositionM2(uint32_t accel, int32_t speed, uint32_t deccel, int32_t position, uint8_t flag)
{
    write_n(19, address, M2SPEEDACCELDECCELPOS, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(deccel), SetDWORDval(position), flag);
}

void MotorController::SpeedAccelDeccelPositionM1M2(uint32_t accel1, uint32_t speed1, uint32_t deccel1, int32_t position1, uint32_t accel2, uint32_t speed2, uint32_t deccel2, int32_t position2, uint8_t flag)
{
    write_n(35, address, MIXEDSPEEDACCELDECCELPOS, SetDWORDval(accel1), SetDWORDval(speed1), SetDWORDval(deccel1), SetDWORDval(position1), SetDWORDval(accel2), SetDWORDval(speed2), SetDWORDval(deccel2), SetDWORDval(position2), flag);
}