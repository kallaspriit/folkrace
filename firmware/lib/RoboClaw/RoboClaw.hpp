#ifndef ROBOCLAW_H
#define ROBOCLAW_H
#include "mbed.h"

#define ADR 0x80
#define M1FORWARD 0
#define M1BACKWARD 1
#define SETMINMB 2
#define SETMAXMB 3
#define M2FORWARD 4
#define M2BACKWARD 5
#define M17BIT 6
#define M27BIT 7
#define MIXEDFORWARD 8
#define MIXEDBACKWARD 9
#define MIXEDRIGHT 10
#define MIXEDLEFT 11
#define MIXEDFB 12
#define MIXEDLR 13
#define GETM1ENC 16
#define GETM2ENC 17
#define GETM1SPEED 18
#define GETM2SPEED 19
#define RESETENC 20
#define GETVERSION 21
#define SETM1ENCCOUNT 22
#define SETM2ENCCOUNT 23
#define GETMBATT 24
#define GETLBATT 25
#define SETMINLB 26
#define SETMAXLB 27
#define SETM1PID 28
#define SETM2PID 29
#define GETM1ISPEED 30
#define GETM2ISPEED 31
#define M1DUTY 32
#define M2DUTY 33
#define MIXEDDUTY 34
#define M1SPEED 35
#define M2SPEED 36
#define MIXEDSPEED 37
#define M1SPEEDACCEL 38
#define M2SPEEDACCEL 39
#define MIXEDSPEEDACCEL 40
#define M1SPEEDDIST 41
#define M2SPEEDDIST 42
#define MIXEDSPEEDDIST 43
#define M1SPEEDACCELDIST 44
#define M2SPEEDACCELDIST 45
#define MIXEDSPEEDACCELDIST 46
#define GETBUFFERS 47
#define GETCURRENTS 49
#define MIXEDSPEED2ACCEL 50
#define MIXEDSPEED2ACCELDIST 51
#define M1DUTYACCEL 52
#define M2DUTYACCEL 53
#define MIXEDDUTYACCEL 54
#define READM1PID 55
#define READM2PID 56
#define SETMAINVOLTAGES 57
#define SETLOGICVOLTAGES 58
#define GETMINMAXMAINVOLTAGES 59
#define GETMINMAXLOGICVOLTAGES 60
#define SETM1POSPID 61
#define SETM2POSPID 62
#define READM1POSPID 63
#define READM2POSPID 64
#define M1SPEEDACCELDECCELPOS 65
#define M2SPEEDACCELDECCELPOS 66
#define MIXEDSPEEDACCELDECCELPOS 67
#define SETM1DEFAULTACCEL 68
#define SETM2DEFAULTACCEL 69
#define SETPINFUNCTIONS 74
#define GETPINFUNCTIONS 75
#define RESTOREDEFAULTS 80
#define GETTEMP 82
#define GETTEMP2 83
#define GETERROR 90
#define GETENCODERMODE 91
#define SETM1ENCODERMODE 92
#define SETM2ENCODERMODE 93
#define WRITENVM 94
#define READNVM 95
#define SETCONFIG 98
#define GETCONFIG 99
#define SETM1MAXCURRENT 133
#define SETM2MAXCURRENT 134
#define GETM1MAXCURRENT 135
#define GETM2MAXCURRENT 136
#define SETPWMMODE 148
#define GETPWMMODE 149

class CurrentMeasurement
{
public:
  bool isValid;
  float currentM1;
  float currentM2;

  CurrentMeasurement(bool isValid, float currentM1, float currentM2) : isValid(isValid),
                                                                       currentM1(currentM1),
                                                                       currentM2(currentM2) {}
};

class RoboClaw
{

public:
  RoboClaw(uint8_t adr, int baudrate, PinName rx, PinName tx);

  void forwardM1(int speed);
  void backwardM1(int speed);
  void forwardM2(int speed);
  void backwardM2(int speed);
  void forward(int speed);
  void backward(int speed);

  uint32_t getEncoderDeltaM1(uint8_t *status, bool *valid);
  uint32_t getEncoderDeltaM2(uint8_t *status, bool *valid);
  int32_t getSpeedM1();
  int32_t getSpeedM2();

  float getMainBatteryVoltage(bool *valid);
  CurrentMeasurement getCurrents();

  void resetEncoders();

  void setSpeedM1(int32_t speed);
  void setSpeedM2(int32_t speed);
  void setSpeedAccelerationM1(int32_t accel, int32_t speed);
  void setSpeedAccelerationM2(int32_t accel, int32_t speed);
  void setSpeedAccelerationM1M2(int32_t accel, int32_t speed1, int32_t speed2);
  void setSpeedDistanceM1(int32_t speed, uint32_t distance, uint8_t buffer);
  void setSpeedDistanceM2(int32_t speed, uint32_t distance, uint8_t buffer);
  void setSpeedAccelerationDistanceM1(int32_t accel, int32_t speed, uint32_t distance, uint8_t buffer);
  void setSpeedAccelerationDistanceM2(int32_t accel, int32_t speed, uint32_t distance, uint8_t buffer);
  void setSpeedAccelerationDeaccelerationPositionM1(uint32_t accel, int32_t speed, uint32_t deccel, int32_t position, uint8_t flag);
  void setSpeedAccelerationDeaccelerationPositionM2(uint32_t accel, int32_t speed, uint32_t deccel, int32_t position, uint8_t flag);
  void setSpeedAccelerationDeaccelerationPositionM1M2(uint32_t accel1, uint32_t speed1, uint32_t deccel1, int32_t position1, uint32_t accel2, uint32_t speed2, uint32_t deccel2, int32_t position2, uint8_t flag);

private:
  void flush();
  uint32_t read4_1(uint8_t address, uint8_t cmd, uint8_t *status, bool *valid);
  uint32_t read4(uint8_t address, uint8_t cmd, bool *valid);
  uint16_t read2(uint8_t address, uint8_t cmd, bool *valid);
  uint16_t read(int timeoutUs = 2000);

  Serial serial;
  Timer readTimer;
  uint16_t crc;
  uint8_t address;
  void clearCrc();
  void updateCrc(uint8_t data);
  uint16_t getCrc();

  void write(uint8_t cnt, ...);
  void writeCommand(uint8_t command, uint8_t data, bool reading, bool crcon);

  uint16_t crc16(uint8_t *packet, int nBytes);
};

#endif