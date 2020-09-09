#include "RoboClaw.hpp"

#define MAXRETRY 2
#define SetDWORDval(arg) (uint8_t)(((uint32_t)arg) >> 24), (uint8_t)(((uint32_t)arg) >> 16), (uint8_t)(((uint32_t)arg) >> 8), (uint8_t)arg
#define SetWORDval(arg) (uint8_t)(((uint16_t)arg) >> 8), (uint8_t)arg

RoboClaw::RoboClaw(Serial *serial, int timeout) : serial(serial), timeout(timeout)
{
}

RoboClaw::~RoboClaw()
{
}

int RoboClaw::write(int byte)
{
    return serial->putc(byte);
}

int RoboClaw::read()
{
    return serial->getc();
}

int RoboClaw::available()
{
    return serial->readable();
}

void RoboClaw::flush()
{
    while (serial->readable())
    {
        serial->getc();
    }
}

int RoboClaw::read(int timeout)
{
    readTimer.reset();
    readTimer.start();

    while (!serial->readable())
    {
        int waitedTimeUs = readTimer.read_us();

        if (waitedTimeUs >= (int)timeout)
        {
            readTimer.stop();

            return -1;
        }
    }

    readTimer.stop();

    return serial->getc();
}

void RoboClaw::clear()
{
    while (serial->readable())
    {
        serial->getc();
    }
}

void RoboClaw::clearCrc()
{
    crc = 0;
}

void RoboClaw::updateCrc(uint8_t data)
{
    crc = crc ^ ((uint16_t)data << 8);

    for (int i = 0; i < 8; i++)
    {
        if (crc & 0x8000)
        {
            crc = (crc << 1) ^ 0x1021;
        }
        else
        {
            crc <<= 1;
        }
    }
}

uint16_t RoboClaw::getCrc()
{
    return crc;
}

bool RoboClaw::writeN(uint8_t cnt, ...)
{
    uint8_t trys = MAXRETRY;

    do
    {
        clearCrc();

        va_list marker;
        va_start(marker, cnt);

        for (uint8_t index = 0; index < cnt; index++)
        {
            uint8_t data = va_arg(marker, int);

            updateCrc(data);
            write(data);
        }

        va_end(marker);

        uint16_t crc = getCrc();

        write(crc >> 8);
        write(crc);

        if (read(timeout) == 0xFF)
        {
            return true;
        }
    } while (trys--);

    return false;
}

bool RoboClaw::readN(uint8_t cnt, uint8_t address, uint8_t cmd, ...)
{
    uint32_t value = 0;
    uint8_t trys = MAXRETRY;
    int16_t data;

    do
    {
        flush();
        clearCrc();
        write(address);
        updateCrc(address);
        write(cmd);
        updateCrc(cmd);

        va_list marker;
        va_start(marker, cmd);

        data = 0;

        for (uint8_t index = 0; index < cnt; index++)
        {
            uint32_t *ptr = va_arg(marker, uint32_t *);

            if (data != -1)
            {
                data = read(timeout);
                updateCrc(data);
                value = (uint32_t)data << 24;
            }
            else
            {
                break;
            }

            if (data != -1)
            {
                data = read(timeout);
                updateCrc(data);
                value |= (uint32_t)data << 16;
            }
            else
            {
                break;
            }

            if (data != -1)
            {
                data = read(timeout);
                updateCrc(data);
                value |= (uint32_t)data << 8;
            }
            else
            {
                break;
            }

            if (data != -1)
            {
                data = read(timeout);
                updateCrc(data);
                value |= (uint32_t)data;
            }
            else
            {
                break;
            }

            *ptr = value;
        }

        va_end(marker);

        if (data != -1)
        {
            uint16_t ccrc;
            data = read(timeout);

            if (data != -1)
            {
                ccrc = data << 8;
                data = read(timeout);

                if (data != -1)
                {
                    ccrc |= data;
                    return getCrc() == ccrc;
                }
            }
        }
    } while (trys--);

    return false;
}

uint8_t RoboClaw::read1(uint8_t address, uint8_t cmd, bool *valid)
{
    if (valid)
    {
        *valid = false;
    }

    uint8_t value = 0;
    uint8_t trys = MAXRETRY;
    int16_t data;

    do
    {
        flush();
        clearCrc();
        write(address);
        updateCrc(address);
        write(cmd);
        updateCrc(cmd);

        data = read(timeout);
        updateCrc(data);
        value = data;

        if (data != -1)
        {
            uint16_t ccrc;
            data = read(timeout);

            if (data != -1)
            {
                ccrc = data << 8;
                data = read(timeout);

                if (data != -1)
                {
                    ccrc |= data;

                    if (getCrc() == ccrc)
                    {
                        if (valid)
                        {
                            *valid = true;
                        }

                        return value;
                    }
                }
            }
        }
    } while (trys--);

    return false;
}

uint16_t RoboClaw::read2(uint8_t address, uint8_t cmd, bool *valid)
{
    if (valid)
    {
        *valid = false;
    }

    uint16_t value = 0;
    uint8_t trys = MAXRETRY;
    int16_t data;

    do
    {
        flush();
        clearCrc();
        write(address);
        updateCrc(address);
        write(cmd);
        updateCrc(cmd);

        data = read(timeout);
        updateCrc(data);
        value = (uint16_t)data << 8;

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            value |= (uint16_t)data;
        }

        if (data != -1)
        {
            uint16_t ccrc;
            data = read(timeout);

            if (data != -1)
            {
                ccrc = data << 8;
                data = read(timeout);

                if (data != -1)
                {
                    ccrc |= data;

                    if (getCrc() == ccrc)
                    {
                        if (valid)
                        {
                            *valid = true;
                        }

                        return value;
                    }
                }
            }
        }
    } while (trys--);

    return false;
}

uint32_t RoboClaw::read4(uint8_t address, uint8_t cmd, bool *valid)
{
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
        write(address);
        updateCrc(address);
        write(cmd);
        updateCrc(cmd);

        data = read(timeout);
        updateCrc(data);
        value = (uint32_t)data << 24;

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            value |= (uint32_t)data << 16;
        }

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            value |= (uint32_t)data << 8;
        }

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            value |= (uint32_t)data;
        }

        if (data != -1)
        {
            uint16_t ccrc;
            data = read(timeout);

            if (data != -1)
            {
                ccrc = data << 8;
                data = read(timeout);

                if (data != -1)
                {
                    ccrc |= data;

                    if (getCrc() == ccrc)
                    {
                        if (valid)
                        {
                            *valid = true;
                        }

                        return value;
                    }
                }
            }
        }
    } while (trys--);

    return false;
}

uint32_t RoboClaw::read4WithStatus(uint8_t address, uint8_t cmd, uint8_t *status, bool *valid)
{
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
        write(address);
        updateCrc(address);
        write(cmd);
        updateCrc(cmd);

        data = read(timeout);
        updateCrc(data);
        value = (uint32_t)data << 24;

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            value |= (uint32_t)data << 16;
        }

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            value |= (uint32_t)data << 8;
        }

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            value |= (uint32_t)data;
        }

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);

            if (status)
            {
                *status = data;
            }
        }

        if (data != -1)
        {
            uint16_t ccrc;
            data = read(timeout);

            if (data != -1)
            {
                ccrc = data << 8;
                data = read(timeout);

                if (data != -1)
                {
                    ccrc |= data;

                    if (getCrc() == ccrc)
                    {
                        if (valid)
                        {
                            *valid = true;
                        }

                        return value;
                    }
                }
            }
        }
    } while (trys--);

    return false;
}

bool RoboClaw::forwardM1(uint8_t address, uint8_t speed)
{
    return writeN(3, address, M1FORWARD, speed);
}

bool RoboClaw::backwardM1(uint8_t address, uint8_t speed)
{
    return writeN(3, address, M1BACKWARD, speed);
}

bool RoboClaw::setMinVoltageMainBattery(uint8_t address, uint8_t voltage)
{
    return writeN(3, address, SETMINMB, voltage);
}

bool RoboClaw::setMaxVoltageMainBattery(uint8_t address, uint8_t voltage)
{
    return writeN(3, address, SETMAXMB, voltage);
}

bool RoboClaw::forwardM2(uint8_t address, uint8_t speed)
{
    return writeN(3, address, M2FORWARD, speed);
}

bool RoboClaw::backwardM2(uint8_t address, uint8_t speed)
{
    return writeN(3, address, M2BACKWARD, speed);
}

bool RoboClaw::forwardBackwardM1(uint8_t address, uint8_t speed)
{
    return writeN(3, address, M17BIT, speed);
}

bool RoboClaw::forwardBackwardM2(uint8_t address, uint8_t speed)
{
    return writeN(3, address, M27BIT, speed);
}

bool RoboClaw::forwardMixed(uint8_t address, uint8_t speed)
{
    return writeN(3, address, MIXEDFORWARD, speed);
}

bool RoboClaw::backwardMixed(uint8_t address, uint8_t speed)
{
    return writeN(3, address, MIXEDBACKWARD, speed);
}

bool RoboClaw::turnRightMixed(uint8_t address, uint8_t speed)
{
    return writeN(3, address, MIXEDRIGHT, speed);
}

bool RoboClaw::turnLeftMixed(uint8_t address, uint8_t speed)
{
    return writeN(3, address, MIXEDLEFT, speed);
}

bool RoboClaw::forwardbackwardMixed(uint8_t address, uint8_t speed)
{
    return writeN(3, address, MIXEDFB, speed);
}

bool RoboClaw::leftRightMixed(uint8_t address, uint8_t speed)
{
    return writeN(3, address, MIXEDLR, speed);
}

uint32_t RoboClaw::readEncM1(uint8_t address, uint8_t *status, bool *valid)
{
    return read4WithStatus(address, GETM1ENC, status, valid);
}

uint32_t RoboClaw::readEncM2(uint8_t address, uint8_t *status, bool *valid)
{
    return read4WithStatus(address, GETM2ENC, status, valid);
}

uint32_t RoboClaw::readSpeedM1(uint8_t address, uint8_t *status, bool *valid)
{
    return read4WithStatus(address, GETM1SPEED, status, valid);
}

uint32_t RoboClaw::readSpeedM2(uint8_t address, uint8_t *status, bool *valid)
{
    return read4WithStatus(address, GETM2SPEED, status, valid);
}

bool RoboClaw::resetEncoders(uint8_t address)
{
    return writeN(2, address, RESETENC);
}

bool RoboClaw::readVersion(uint8_t address, char *version)
{
    int16_t data;
    uint8_t trys = MAXRETRY;

    do
    {
        flush();

        data = 0;

        clearCrc();
        write(address);
        updateCrc(address);
        write(GETVERSION);
        updateCrc(GETVERSION);

        uint8_t i;

        for (i = 0; i < 48; i++)
        {
            if (data != -1)
            {
                data = read(timeout);
                version[i] = data;
                updateCrc(version[i]);

                if (version[i] == 0)
                {
                    uint16_t ccrc;
                    data = read(timeout);

                    if (data != -1)
                    {
                        ccrc = data << 8;
                        data = read(timeout);

                        if (data != -1)
                        {
                            ccrc |= data;

                            return getCrc() == ccrc;
                        }
                    }
                    break;
                }
            }
            else
            {
                break;
            }
        }
    } while (trys--);

    return false;
}

bool RoboClaw::setEncM1(uint8_t address, int32_t val)
{
    return writeN(6, address, SETM1ENCCOUNT, SetDWORDval(val));
}

bool RoboClaw::setEncM2(uint8_t address, int32_t val)
{
    return writeN(6, address, SETM2ENCCOUNT, SetDWORDval(val));
}

uint16_t RoboClaw::readMainBatteryVoltage(uint8_t address, bool *valid)
{
    return read2(address, GETMBATT, valid);
}

uint16_t RoboClaw::readLogicBatteryVoltage(uint8_t address, bool *valid)
{
    return read2(address, GETLBATT, valid);
}

bool RoboClaw::setMinVoltageLogicBattery(uint8_t address, uint8_t voltage)
{
    return writeN(3, address, SETMINLB, voltage);
}

bool RoboClaw::setMaxVoltageLogicBattery(uint8_t address, uint8_t voltage)
{
    return writeN(3, address, SETMAXLB, voltage);
}

bool RoboClaw::setM1VelocityPID(uint8_t address, float kp_fp, float ki_fp, float kd_fp, uint32_t qpps)
{
    uint32_t kp = kp_fp * 65536;
    uint32_t ki = ki_fp * 65536;
    uint32_t kd = kd_fp * 65536;

    return writeN(18, address, SETM1PID, SetDWORDval(kd), SetDWORDval(kp), SetDWORDval(ki), SetDWORDval(qpps));
}

bool RoboClaw::setM2VelocityPID(uint8_t address, float kp_fp, float ki_fp, float kd_fp, uint32_t qpps)
{
    uint32_t kp = kp_fp * 65536;
    uint32_t ki = ki_fp * 65536;
    uint32_t kd = kd_fp * 65536;

    return writeN(18, address, SETM2PID, SetDWORDval(kd), SetDWORDval(kp), SetDWORDval(ki), SetDWORDval(qpps));
}

uint32_t RoboClaw::readISpeedM1(uint8_t address, uint8_t *status, bool *valid)
{
    return read4WithStatus(address, GETM1ISPEED, status, valid);
}

uint32_t RoboClaw::readISpeedM2(uint8_t address, uint8_t *status, bool *valid)
{
    return read4WithStatus(address, GETM2ISPEED, status, valid);
}

bool RoboClaw::dutyM1(uint8_t address, uint16_t duty)
{
    return writeN(4, address, M1DUTY, SetWORDval(duty));
}

bool RoboClaw::dutyM2(uint8_t address, uint16_t duty)
{
    return writeN(4, address, M2DUTY, SetWORDval(duty));
}

bool RoboClaw::dutyM1M2(uint8_t address, uint16_t duty1, uint16_t duty2)
{
    return writeN(6, address, MIXEDDUTY, SetWORDval(duty1), SetWORDval(duty2));
}

bool RoboClaw::speedM1(uint8_t address, uint32_t speed)
{
    return writeN(6, address, M1SPEED, SetDWORDval(speed));
}

bool RoboClaw::speedM2(uint8_t address, uint32_t speed)
{
    return writeN(6, address, M2SPEED, SetDWORDval(speed));
}

bool RoboClaw::speedM1M2(uint8_t address, uint32_t speed1, uint32_t speed2)
{
    return writeN(10, address, MIXEDSPEED, SetDWORDval(speed1), SetDWORDval(speed2));
}

bool RoboClaw::speedAccelM1(uint8_t address, uint32_t accel, uint32_t speed)
{
    return writeN(10, address, M1SPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed));
}

bool RoboClaw::speedAccelM2(uint8_t address, uint32_t accel, uint32_t speed)
{
    return writeN(10, address, M2SPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed));
}
bool RoboClaw::speedAccelM1M2(uint8_t address, uint32_t accel, uint32_t speed1, uint32_t speed2)
{
    return writeN(14, address, MIXEDSPEEDACCEL, SetDWORDval(accel), SetDWORDval(speed1), SetDWORDval(speed2));
}

bool RoboClaw::speedDistanceM1(uint8_t address, uint32_t speed, uint32_t distance, uint8_t flag)
{
    return writeN(11, address, M1SPEEDDIST, SetDWORDval(speed), SetDWORDval(distance), flag);
}

bool RoboClaw::speedDistanceM2(uint8_t address, uint32_t speed, uint32_t distance, uint8_t flag)
{
    return writeN(11, address, M2SPEEDDIST, SetDWORDval(speed), SetDWORDval(distance), flag);
}

bool RoboClaw::speedDistanceM1M2(uint8_t address, uint32_t speed1, uint32_t distance1, uint32_t speed2, uint32_t distance2, uint8_t flag)
{
    return writeN(19, address, MIXEDSPEEDDIST, SetDWORDval(speed1), SetDWORDval(distance1), SetDWORDval(speed2), SetDWORDval(distance2), flag);
}

bool RoboClaw::speedAccelDistanceM1(uint8_t address, uint32_t accel, uint32_t speed, uint32_t distance, uint8_t flag)
{
    return writeN(15, address, M1SPEEDACCELDIST, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(distance), flag);
}

bool RoboClaw::speedAccelDistanceM2(uint8_t address, uint32_t accel, uint32_t speed, uint32_t distance, uint8_t flag)
{
    return writeN(15, address, M2SPEEDACCELDIST, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(distance), flag);
}

bool RoboClaw::speedAccelDistanceM1M2(uint8_t address, uint32_t accel, uint32_t speed1, uint32_t distance1, uint32_t speed2, uint32_t distance2, uint8_t flag)
{
    return writeN(23, address, MIXEDSPEEDACCELDIST, SetDWORDval(accel), SetDWORDval(speed1), SetDWORDval(distance1), SetDWORDval(speed2), SetDWORDval(distance2), flag);
}

bool RoboClaw::readBuffers(uint8_t address, uint8_t &depth1, uint8_t &depth2)
{
    bool valid;
    uint16_t value = read2(address, GETBUFFERS, &valid);

    if (valid)
    {
        depth1 = value >> 8;
        depth2 = value;
    }

    return valid;
}

bool RoboClaw::readPWMs(uint8_t address, int16_t &pwm1, int16_t &pwm2)
{
    bool valid;
    uint32_t value = read4(address, GETPWMS, &valid);

    if (valid)
    {
        pwm1 = value >> 16;
        pwm2 = value & 0xFFFF;
    }

    return valid;
}

bool RoboClaw::readCurrents(uint8_t address, int16_t &current1, int16_t &current2)
{
    bool valid;
    uint32_t value = read4(address, GETCURRENTS, &valid);

    if (valid)
    {
        current1 = value >> 16;
        current2 = value & 0xFFFF;
    }

    return valid;
}

bool RoboClaw::speedAccelM1M2_2(uint8_t address, uint32_t accel1, uint32_t speed1, uint32_t accel2, uint32_t speed2)
{
    return writeN(18, address, MIXEDSPEED2ACCEL, SetDWORDval(accel1), SetDWORDval(speed1), SetDWORDval(accel2), SetDWORDval(speed2));
}

bool RoboClaw::speedAccelDistanceM1M2_2(uint8_t address, uint32_t accel1, uint32_t speed1, uint32_t distance1, uint32_t accel2, uint32_t speed2, uint32_t distance2, uint8_t flag)
{
    return writeN(27, address, MIXEDSPEED2ACCELDIST, SetDWORDval(accel1), SetDWORDval(speed1), SetDWORDval(distance1), SetDWORDval(accel2), SetDWORDval(speed2), SetDWORDval(distance2), flag);
}

bool RoboClaw::dutyAccelM1(uint8_t address, uint16_t duty, uint32_t accel)
{
    return writeN(8, address, M1DUTYACCEL, SetWORDval(duty), SetDWORDval(accel));
}

bool RoboClaw::dutyAccelM2(uint8_t address, uint16_t duty, uint32_t accel)
{
    return writeN(8, address, M2DUTYACCEL, SetWORDval(duty), SetDWORDval(accel));
}

bool RoboClaw::dutyAccelM1M2(uint8_t address, uint16_t duty1, uint32_t accel1, uint16_t duty2, uint32_t accel2)
{
    return writeN(14, address, MIXEDDUTYACCEL, SetWORDval(duty1), SetDWORDval(accel1), SetWORDval(duty2), SetDWORDval(accel2));
}

bool RoboClaw::readM1VelocityPID(uint8_t address, float &Kp_fp, float &Ki_fp, float &Kd_fp, uint32_t &qpps)
{
    uint32_t Kp, Ki, Kd;
    bool valid = readN(4, address, READM1PID, &Kp, &Ki, &Kd, &qpps);

    Kp_fp = ((float)Kp) / 65536;
    Ki_fp = ((float)Ki) / 65536;
    Kd_fp = ((float)Kd) / 65536;

    return valid;
}

bool RoboClaw::readM2VelocityPID(uint8_t address, float &Kp_fp, float &Ki_fp, float &Kd_fp, uint32_t &qpps)
{
    uint32_t Kp, Ki, Kd;
    bool valid = readN(4, address, READM2PID, &Kp, &Ki, &Kd, &qpps);

    Kp_fp = ((float)Kp) / 65536;
    Ki_fp = ((float)Ki) / 65536;
    Kd_fp = ((float)Kd) / 65536;

    return valid;
}

bool RoboClaw::setMainVoltages(uint8_t address, uint16_t min, uint16_t max)
{
    return writeN(6, address, SETMAINVOLTAGES, SetWORDval(min), SetWORDval(max));
}

bool RoboClaw::setLogicVoltages(uint8_t address, uint16_t min, uint16_t max)
{
    return writeN(6, address, SETLOGICVOLTAGES, SetWORDval(min), SetWORDval(max));
}

bool RoboClaw::readMinMaxMainVoltages(uint8_t address, uint16_t &min, uint16_t &max)
{
    bool valid;
    uint32_t value = read4(address, GETMINMAXMAINVOLTAGES, &valid);

    if (valid)
    {
        min = value >> 16;
        max = value & 0xFFFF;
    }

    return valid;
}

bool RoboClaw::readMinMaxLogicVoltages(uint8_t address, uint16_t &min, uint16_t &max)
{
    bool valid;
    uint32_t value = read4(address, GETMINMAXLOGICVOLTAGES, &valid);

    if (valid)
    {
        min = value >> 16;
        max = value & 0xFFFF;
    }

    return valid;
}

bool RoboClaw::setM1PositionPID(uint8_t address, float kp_fp, float ki_fp, float kd_fp, uint32_t kiMax, uint32_t deadzone, uint32_t min, uint32_t max)
{
    uint32_t kp = kp_fp * 1024;
    uint32_t ki = ki_fp * 1024;
    uint32_t kd = kd_fp * 1024;

    return writeN(30, address, SETM1POSPID, SetDWORDval(kd), SetDWORDval(kp), SetDWORDval(ki), SetDWORDval(kiMax), SetDWORDval(deadzone), SetDWORDval(min), SetDWORDval(max));
}

bool RoboClaw::setM2PositionPID(uint8_t address, float kp_fp, float ki_fp, float kd_fp, uint32_t kiMax, uint32_t deadzone, uint32_t min, uint32_t max)
{
    uint32_t kp = kp_fp * 1024;
    uint32_t ki = ki_fp * 1024;
    uint32_t kd = kd_fp * 1024;

    return writeN(30, address, SETM2POSPID, SetDWORDval(kd), SetDWORDval(kp), SetDWORDval(ki), SetDWORDval(kiMax), SetDWORDval(deadzone), SetDWORDval(min), SetDWORDval(max));
}

bool RoboClaw::readM1PositionPID(uint8_t address, float &Kp_fp, float &Ki_fp, float &Kd_fp, uint32_t &KiMax, uint32_t &DeadZone, uint32_t &Min, uint32_t &Max)
{
    uint32_t Kp, Ki, Kd;

    bool valid = readN(7, address, READM1POSPID, &Kp, &Ki, &Kd, &KiMax, &DeadZone, &Min, &Max);

    Kp_fp = ((float)Kp) / 1024;
    Ki_fp = ((float)Ki) / 1024;
    Kd_fp = ((float)Kd) / 1024;

    return valid;
}

bool RoboClaw::readM2PositionPID(uint8_t address, float &Kp_fp, float &Ki_fp, float &Kd_fp, uint32_t &KiMax, uint32_t &DeadZone, uint32_t &Min, uint32_t &Max)
{
    uint32_t Kp, Ki, Kd;

    bool valid = readN(7, address, READM2POSPID, &Kp, &Ki, &Kd, &KiMax, &DeadZone, &Min, &Max);

    Kp_fp = ((float)Kp) / 1024;
    Ki_fp = ((float)Ki) / 1024;
    Kd_fp = ((float)Kd) / 1024;

    return valid;
}

bool RoboClaw::speedAccelDeccelPositionM1(uint8_t address, uint32_t accel, uint32_t speed, uint32_t deccel, uint32_t position, uint8_t flag)
{
    return writeN(19, address, M1SPEEDACCELDECCELPOS, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(deccel), SetDWORDval(position), flag);
}

bool RoboClaw::speedAccelDeccelPositionM2(uint8_t address, uint32_t accel, uint32_t speed, uint32_t deccel, uint32_t position, uint8_t flag)
{
    return writeN(19, address, M2SPEEDACCELDECCELPOS, SetDWORDval(accel), SetDWORDval(speed), SetDWORDval(deccel), SetDWORDval(position), flag);
}

bool RoboClaw::speedAccelDeccelPositionM1M2(uint8_t address, uint32_t accel1, uint32_t speed1, uint32_t deccel1, uint32_t position1, uint32_t accel2, uint32_t speed2, uint32_t deccel2, uint32_t position2, uint8_t flag)
{
    return writeN(35, address, MIXEDSPEEDACCELDECCELPOS, SetDWORDval(accel1), SetDWORDval(speed1), SetDWORDval(deccel1), SetDWORDval(position1), SetDWORDval(accel2), SetDWORDval(speed2), SetDWORDval(deccel2), SetDWORDval(position2), flag);
}

bool RoboClaw::setM1DefaultAccel(uint8_t address, uint32_t accel)
{
    return writeN(6, address, SETM1DEFAULTACCEL, SetDWORDval(accel));
}

bool RoboClaw::setM2DefaultAccel(uint8_t address, uint32_t accel)
{
    return writeN(6, address, SETM2DEFAULTACCEL, SetDWORDval(accel));
}

bool RoboClaw::setPinFunctions(uint8_t address, uint8_t S3mode, uint8_t S4mode, uint8_t S5mode)
{
    return writeN(5, address, SETPINFUNCTIONS, S3mode, S4mode, S5mode);
}

bool RoboClaw::getPinFunctions(uint8_t address, uint8_t &S3mode, uint8_t &S4mode, uint8_t &S5mode)
{
    uint8_t val1, val2, val3;
    uint8_t trys = MAXRETRY;
    int16_t data;

    do
    {
        flush();
        clearCrc();
        write(address);
        updateCrc(address);
        write(GETPINFUNCTIONS);
        updateCrc(GETPINFUNCTIONS);

        data = read(timeout);
        updateCrc(data);
        val1 = data;

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            val2 = data;
        }

        if (data != -1)
        {
            data = read(timeout);
            updateCrc(data);
            val3 = data;
        }

        if (data != -1)
        {
            uint16_t ccrc;
            data = read(timeout);

            if (data != -1)
            {
                ccrc = data << 8;
                data = read(timeout);

                if (data != -1)
                {
                    ccrc |= data;

                    if (getCrc() == ccrc)
                    {
                        S3mode = val1;
                        S4mode = val2;
                        S5mode = val3;

                        return true;
                    }
                }
            }
        }
    } while (trys--);

    return false;
}

bool RoboClaw::setDeadBand(uint8_t address, uint8_t Min, uint8_t Max)
{
    return writeN(4, address, SETDEADBAND, Min, Max);
}

bool RoboClaw::getDeadBand(uint8_t address, uint8_t &Min, uint8_t &Max)
{
    bool valid;
    uint16_t value = read2(address, GETDEADBAND, &valid);

    if (valid)
    {
        Min = value >> 8;
        Max = value;
    }

    return valid;
}

bool RoboClaw::readEncoders(uint8_t address, uint32_t &enc1, uint32_t &enc2)
{
    bool valid = readN(2, address, GETENCODERS, &enc1, &enc2);

    return valid;
}

bool RoboClaw::readISpeeds(uint8_t address, uint32_t &ispeed1, uint32_t &ispeed2)
{
    bool valid = readN(2, address, GETISPEEDS, &ispeed1, &ispeed2);

    return valid;
}

bool RoboClaw::restoreDefaults(uint8_t address)
{
    return writeN(2, address, RESTOREDEFAULTS);
}

bool RoboClaw::readTemp(uint8_t address, uint16_t &temp)
{
    bool valid;
    temp = read2(address, GETTEMP, &valid);

    return valid;
}

bool RoboClaw::readTemp2(uint8_t address, uint16_t &temp)
{
    bool valid;
    temp = read2(address, GETTEMP2, &valid);

    return valid;
}

uint32_t RoboClaw::ReadError(uint8_t address, bool *valid)
{
    return read4(address, GETERROR, valid);
}

bool RoboClaw::readEncoderModes(uint8_t address, uint8_t &M1mode, uint8_t &M2mode)
{
    bool valid;
    uint16_t value = read2(address, GETENCODERMODE, &valid);

    if (valid)
    {
        M1mode = value >> 8;
        M2mode = value;
    }

    return valid;
}

bool RoboClaw::setM1EncoderMode(uint8_t address, uint8_t mode)
{
    return writeN(3, address, SETM1ENCODERMODE, mode);
}

bool RoboClaw::setM2EncoderMode(uint8_t address, uint8_t mode)
{
    return writeN(3, address, SETM2ENCODERMODE, mode);
}

bool RoboClaw::writeNVM(uint8_t address)
{
    return writeN(6, address, WRITENVM, SetDWORDval(0xE22EAB7A));
}

bool RoboClaw::readNVM(uint8_t address)
{
    return writeN(2, address, READNVM);
}

bool RoboClaw::SetConfig(uint8_t address, uint16_t config)
{
    return writeN(4, address, SETCONFIG, SetWORDval(config));
}

bool RoboClaw::GetConfig(uint8_t address, uint16_t &config)
{
    bool valid;
    uint16_t value = read2(address, GETCONFIG, &valid);

    if (valid)
    {
        config = value;
    }

    return valid;
}

bool RoboClaw::setM1MaxCurrent(uint8_t address, uint32_t max)
{
    return writeN(10, address, SETM1MAXCURRENT, SetDWORDval(max), SetDWORDval(0));
}

bool RoboClaw::setM2MaxCurrent(uint8_t address, uint32_t max)
{
    return writeN(10, address, SETM2MAXCURRENT, SetDWORDval(max), SetDWORDval(0));
}

bool RoboClaw::readM1MaxCurrent(uint8_t address, uint32_t &max)
{
    uint32_t tmax, dummy;

    bool valid = readN(2, address, GETM1MAXCURRENT, &tmax, &dummy);

    if (valid)
    {
        max = tmax;
    }

    return valid;
}

bool RoboClaw::readM2MaxCurrent(uint8_t address, uint32_t &max)
{
    uint32_t tmax, dummy;

    bool valid = readN(2, address, GETM2MAXCURRENT, &tmax, &dummy);

    if (valid)
    {
        max = tmax;
    }

    return valid;
}

bool RoboClaw::setPWMMode(uint8_t address, uint8_t mode)
{
    return writeN(3, address, SETPWMMODE, mode);
}

bool RoboClaw::getPWMMode(uint8_t address, uint8_t &mode)
{
    bool valid;

    uint8_t value = read1(address, GETPWMMODE, &valid);

    if (valid)
    {
        mode = value;
    }

    return valid;
}
