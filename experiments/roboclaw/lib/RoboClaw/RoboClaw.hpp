#ifndef ROBOCLAW_H
#define ROBOCLAW_H

#include "mbed.h"

class RoboClaw
{
    enum
    {
        ERROR_NONE = 0x000000,
        ERROR_ESTOP = 0x000001,        //Error: E-Stop active
        ERROR_TEMP = 0x000002,         //Error: Temperature Sensor 1 >=100c
        ERROR_TEMP2 = 0x000004,        //Error: Temperature Sensor 2 >=100C (available only on some models)
        ERROR_MBATHIGH = 0x000008,     //Error: Main Battery Over Voltage
        ERROR_LBATHIGH = 0x000010,     //Error: Logic Battery High Voltage
        ERROR_LBATLOW = 0x000020,      //Error: Logic Battery Low Voltage
        ERROR_FAULTM1 = 0x000040,      //Error: Motor 1 Driver Fault (only on some models)
        ERROR_FAULTM2 = 0x000080,      //Error: Motor 2 Driver Fault (only on some models)
        ERROR_SPEED1 = 0x000100,       //Error: Motor 1 Speed Error Limit
        ERROR_SPEED2 = 0x000200,       //Error: Motor 2 Speed Error Limit
        ERROR_POS1 = 0x000400,         //Error: Motor 1 Position Error Limit
        ERROR_POS2 = 0x000800,         //Error: MOtor2 Position Error Limit
        WARN_OVERCURRENTM1 = 0x010000, //Warning: Motor 1 Current Limited
        WARN_OVERCURRENTM2 = 0x020000, //Warning: Motor 2 CUrrent Limited
        WARN_MBATHIGH = 0x040000,      //Warning: Main Battery Voltage High
        WARN_MBATLOW = 0x080000,       //Warning: Main Battery Low Voltage
        WARN_TEMP = 0x100000,          //Warning: Temperaure Sensor 1 >=85C
        WARN_TEMP2 = 0x200000,         //Warning: Temperature Sensor 2 >=85C (available only on some models)
        WARN_S4 = 0x400000,            //Warning: Motor 1 Home/Limit Signal
        WARN_S5 = 0x800000,            //Warning: Motor 2 Home/Limit Signal
    };

    enum
    {
        M1FORWARD = 0,
        M1BACKWARD = 1,
        SETMINMB = 2,
        SETMAXMB = 3,
        M2FORWARD = 4,
        M2BACKWARD = 5,
        M17BIT = 6,
        M27BIT = 7,
        MIXEDFORWARD = 8,
        MIXEDBACKWARD = 9,
        MIXEDRIGHT = 10,
        MIXEDLEFT = 11,
        MIXEDFB = 12,
        MIXEDLR = 13,
        GETM1ENC = 16,
        GETM2ENC = 17,
        GETM1SPEED = 18,
        GETM2SPEED = 19,
        RESETENC = 20,
        GETVERSION = 21,
        SETM1ENCCOUNT = 22,
        SETM2ENCCOUNT = 23,
        GETMBATT = 24,
        GETLBATT = 25,
        SETMINLB = 26,
        SETMAXLB = 27,
        SETM1PID = 28,
        SETM2PID = 29,
        GETM1ISPEED = 30,
        GETM2ISPEED = 31,
        M1DUTY = 32,
        M2DUTY = 33,
        MIXEDDUTY = 34,
        M1SPEED = 35,
        M2SPEED = 36,
        MIXEDSPEED = 37,
        M1SPEEDACCEL = 38,
        M2SPEEDACCEL = 39,
        MIXEDSPEEDACCEL = 40,
        M1SPEEDDIST = 41,
        M2SPEEDDIST = 42,
        MIXEDSPEEDDIST = 43,
        M1SPEEDACCELDIST = 44,
        M2SPEEDACCELDIST = 45,
        MIXEDSPEEDACCELDIST = 46,
        GETBUFFERS = 47,
        GETPWMS = 48,
        GETCURRENTS = 49,
        MIXEDSPEED2ACCEL = 50,
        MIXEDSPEED2ACCELDIST = 51,
        M1DUTYACCEL = 52,
        M2DUTYACCEL = 53,
        MIXEDDUTYACCEL = 54,
        READM1PID = 55,
        READM2PID = 56,
        SETMAINVOLTAGES = 57,
        SETLOGICVOLTAGES = 58,
        GETMINMAXMAINVOLTAGES = 59,
        GETMINMAXLOGICVOLTAGES = 60,
        SETM1POSPID = 61,
        SETM2POSPID = 62,
        READM1POSPID = 63,
        READM2POSPID = 64,
        M1SPEEDACCELDECCELPOS = 65,
        M2SPEEDACCELDECCELPOS = 66,
        MIXEDSPEEDACCELDECCELPOS = 67,
        SETM1DEFAULTACCEL = 68,
        SETM2DEFAULTACCEL = 69,
        SETPINFUNCTIONS = 74,
        GETPINFUNCTIONS = 75,
        SETDEADBAND = 76,
        GETDEADBAND = 77,
        GETENCODERS = 78,
        GETISPEEDS = 79,
        RESTOREDEFAULTS = 80,
        GETTEMP = 82,
        GETTEMP2 = 83, //Only valid on some models
        GETERROR = 90,
        GETENCODERMODE = 91,
        SETM1ENCODERMODE = 92,
        SETM2ENCODERMODE = 93,
        WRITENVM = 94,
        READNVM = 95, //Reloads values from Flash into Ram
        SETCONFIG = 98,
        GETCONFIG = 99,
        SETM1MAXCURRENT = 133,
        SETM2MAXCURRENT = 134,
        GETM1MAXCURRENT = 135,
        GETM2MAXCURRENT = 136,
        SETPWMMODE = 148,
        GETPWMMODE = 149,
        FLAGBOOTLOADER = 255
    };

public:
    RoboClaw(Serial *serial, int tout);
    ~RoboClaw();

    bool forwardM1(uint8_t address, uint8_t speed);
    bool backwardM1(uint8_t address, uint8_t speed);
    bool setMinVoltageMainBattery(uint8_t address, uint8_t voltage);
    bool setMaxVoltageMainBattery(uint8_t address, uint8_t voltage);
    bool forwardM2(uint8_t address, uint8_t speed);
    bool backwardM2(uint8_t address, uint8_t speed);
    bool forwardBackwardM1(uint8_t address, uint8_t speed);
    bool forwardBackwardM2(uint8_t address, uint8_t speed);
    bool forwardMixed(uint8_t address, uint8_t speed);
    bool backwardMixed(uint8_t address, uint8_t speed);
    bool turnRightMixed(uint8_t address, uint8_t speed);
    bool turnLeftMixed(uint8_t address, uint8_t speed);
    bool forwardbackwardMixed(uint8_t address, uint8_t speed);
    bool leftRightMixed(uint8_t address, uint8_t speed);
    uint32_t readEncM1(uint8_t address, uint8_t *status = NULL, bool *valid = NULL);
    uint32_t readEncM2(uint8_t address, uint8_t *status = NULL, bool *valid = NULL);
    bool setEncM1(uint8_t address, int32_t val);
    bool setEncM2(uint8_t address, int32_t val);
    uint32_t readSpeedM1(uint8_t address, uint8_t *status = NULL, bool *valid = NULL);
    uint32_t readSpeedM2(uint8_t address, uint8_t *status = NULL, bool *valid = NULL);
    bool resetEncoders(uint8_t address);
    bool readVersion(uint8_t address, char *version);
    uint16_t readMainBatteryVoltage(uint8_t address, bool *valid = NULL);
    uint16_t readLogicBatteryVoltage(uint8_t address, bool *valid = NULL);
    bool setMinVoltageLogicBattery(uint8_t address, uint8_t voltage);
    bool setMaxVoltageLogicBattery(uint8_t address, uint8_t voltage);
    bool setM1VelocityPID(uint8_t address, float Kp, float Ki, float Kd, uint32_t qpps);
    bool setM2VelocityPID(uint8_t address, float Kp, float Ki, float Kd, uint32_t qpps);
    uint32_t readISpeedM1(uint8_t address, uint8_t *status = NULL, bool *valid = NULL);
    uint32_t readISpeedM2(uint8_t address, uint8_t *status = NULL, bool *valid = NULL);
    bool dutyM1(uint8_t address, uint16_t duty);
    bool dutyM2(uint8_t address, uint16_t duty);
    bool dutyM1M2(uint8_t address, uint16_t duty1, uint16_t duty2);
    bool speedM1(uint8_t address, uint32_t speed);
    bool speedM2(uint8_t address, uint32_t speed);
    bool speedM1M2(uint8_t address, uint32_t speed1, uint32_t speed2);
    bool speedAccelM1(uint8_t address, uint32_t accel, uint32_t speed);
    bool speedAccelM2(uint8_t address, uint32_t accel, uint32_t speed);
    bool speedAccelM1M2(uint8_t address, uint32_t accel, uint32_t speed1, uint32_t speed2);
    bool speedDistanceM1(uint8_t address, uint32_t speed, uint32_t distance, uint8_t flag = 0);
    bool speedDistanceM2(uint8_t address, uint32_t speed, uint32_t distance, uint8_t flag = 0);
    bool speedDistanceM1M2(uint8_t address, uint32_t speed1, uint32_t distance1, uint32_t speed2, uint32_t distance2, uint8_t flag = 0);
    bool speedAccelDistanceM1(uint8_t address, uint32_t accel, uint32_t speed, uint32_t distance, uint8_t flag = 0);
    bool speedAccelDistanceM2(uint8_t address, uint32_t accel, uint32_t speed, uint32_t distance, uint8_t flag = 0);
    bool speedAccelDistanceM1M2(uint8_t address, uint32_t accel, uint32_t speed1, uint32_t distance1, uint32_t speed2, uint32_t distance2, uint8_t flag = 0);
    bool readBuffers(uint8_t address, uint8_t &depth1, uint8_t &depth2);
    bool readPWMs(uint8_t address, int16_t &pwm1, int16_t &pwm2);
    bool readCurrents(uint8_t address, int16_t &current1, int16_t &current2);
    bool speedAccelM1M2_2(uint8_t address, uint32_t accel1, uint32_t speed1, uint32_t accel2, uint32_t speed2);
    bool speedAccelDistanceM1M2_2(uint8_t address, uint32_t accel1, uint32_t speed1, uint32_t distance1, uint32_t accel2, uint32_t speed2, uint32_t distance2, uint8_t flag = 0);
    bool dutyAccelM1(uint8_t address, uint16_t duty, uint32_t accel);
    bool dutyAccelM2(uint8_t address, uint16_t duty, uint32_t accel);
    bool dutyAccelM1M2(uint8_t address, uint16_t duty1, uint32_t accel1, uint16_t duty2, uint32_t accel2);
    bool readM1VelocityPID(uint8_t address, float &Kp_fp, float &Ki_fp, float &Kd_fp, uint32_t &qpps);
    bool readM2VelocityPID(uint8_t address, float &Kp_fp, float &Ki_fp, float &Kd_fp, uint32_t &qpps);
    bool setMainVoltages(uint8_t address, uint16_t min, uint16_t max);
    bool setLogicVoltages(uint8_t address, uint16_t min, uint16_t max);
    bool readMinMaxMainVoltages(uint8_t address, uint16_t &min, uint16_t &max);
    bool readMinMaxLogicVoltages(uint8_t address, uint16_t &min, uint16_t &max);
    bool setM1PositionPID(uint8_t address, float kp, float ki, float kd, uint32_t kiMax, uint32_t deadzone, uint32_t min, uint32_t max);
    bool setM2PositionPID(uint8_t address, float kp, float ki, float kd, uint32_t kiMax, uint32_t deadzone, uint32_t min, uint32_t max);
    bool readM1PositionPID(uint8_t address, float &Kp, float &Ki, float &Kd, uint32_t &KiMax, uint32_t &DeadZone, uint32_t &Min, uint32_t &Max);
    bool readM2PositionPID(uint8_t address, float &Kp, float &Ki, float &Kd, uint32_t &KiMax, uint32_t &DeadZone, uint32_t &Min, uint32_t &Max);
    bool speedAccelDeccelPositionM1(uint8_t address, uint32_t accel, uint32_t speed, uint32_t deccel, uint32_t position, uint8_t flag);
    bool speedAccelDeccelPositionM2(uint8_t address, uint32_t accel, uint32_t speed, uint32_t deccel, uint32_t position, uint8_t flag);
    bool speedAccelDeccelPositionM1M2(uint8_t address, uint32_t accel1, uint32_t speed1, uint32_t deccel1, uint32_t position1, uint32_t accel2, uint32_t speed2, uint32_t deccel2, uint32_t position2, uint8_t flag);
    bool setM1DefaultAccel(uint8_t address, uint32_t accel);
    bool setM2DefaultAccel(uint8_t address, uint32_t accel);
    bool setPinFunctions(uint8_t address, uint8_t S3mode, uint8_t S4mode, uint8_t S5mode);
    bool getPinFunctions(uint8_t address, uint8_t &S3mode, uint8_t &S4mode, uint8_t &S5mode);
    bool setDeadBand(uint8_t address, uint8_t Min, uint8_t Max);
    bool getDeadBand(uint8_t address, uint8_t &Min, uint8_t &Max);
    bool readEncoders(uint8_t address, uint32_t &enc1, uint32_t &enc2);
    bool readISpeeds(uint8_t address, uint32_t &ispeed1, uint32_t &ispeed2);
    bool restoreDefaults(uint8_t address);
    bool readTemp(uint8_t address, uint16_t &temp);
    bool readTemp2(uint8_t address, uint16_t &temp);
    uint32_t ReadError(uint8_t address, bool *valid = NULL);
    bool readEncoderModes(uint8_t address, uint8_t &M1mode, uint8_t &M2mode);
    bool setM1EncoderMode(uint8_t address, uint8_t mode);
    bool setM2EncoderMode(uint8_t address, uint8_t mode);
    bool writeNVM(uint8_t address);
    bool readNVM(uint8_t address);
    bool SetConfig(uint8_t address, uint16_t config);
    bool GetConfig(uint8_t address, uint16_t &config);
    bool setM1MaxCurrent(uint8_t address, uint32_t max);
    bool setM2MaxCurrent(uint8_t address, uint32_t max);
    bool readM1MaxCurrent(uint8_t address, uint32_t &max);
    bool readM2MaxCurrent(uint8_t address, uint32_t &max);
    bool setPWMMode(uint8_t address, uint8_t mode);
    bool getPWMMode(uint8_t address, uint8_t &mode);

    int available();
    int read();
    int read(int timeout);
    int write(int byte);
    void flush();
    void clear();

private:
    void clearCrc();
    void updateCrc(uint8_t data);
    uint16_t getCrc();
    bool writeN(uint8_t byte, ...);
    bool readN(uint8_t byte, uint8_t address, uint8_t cmd, ...);
    uint32_t read4WithStatus(uint8_t address, uint8_t cmd, uint8_t *status, bool *valid);
    uint32_t read4(uint8_t address, uint8_t cmd, bool *valid);
    uint16_t read2(uint8_t address, uint8_t cmd, bool *valid);
    uint8_t read1(uint8_t address, uint8_t cmd, bool *valid);

    uint16_t crc;
    Serial *serial;
    Timer readTimer;
    int timeout;
};

#endif