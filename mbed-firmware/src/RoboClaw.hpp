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

/** The RoboClaw class, yo ucan use the library with : http://www.ionmc.com/RoboClaw-2x15A-Motor-Controller_p_10.html
*   Used to control one or two motors with (or not) encoders
*  @code
* #include "mbed.h"
* #include "RoboClaw.h"
*
* RoboClaw roboclaw(115200, PA_11, PA_12);
*
* int main() {
*     roboclaw.ForwardM1(ADR, 127);
*     while(1);
* }
* @endcode
*/

class RoboClaw
{
public:
  /** Create RoboClaw instance
    */
  RoboClaw(uint8_t adr, int baudrate, PinName rx, PinName tx);

  /** Forward and Backward functions
    * @param address address of the device
    * @param speed speed of the motor (between 0 and 127)
    * @note Forward and Backward functions
    */
  void ForwardM1(int speed);
  void BackwardM1(int speed);
  void ForwardM2(int speed);
  void BackwardM2(int speed);

  /** Forward and Backward functions
    * @param address address of the device
    * @param speed speed of the motor (between 0 and 127)
    * @note Forward and Backward functions, it turns the two motors
    */
  void Forward(int speed);
  void Backward(int speed);

  /** Read the Firmware
    * @param address address of the device
    */
  void ReadFirm();

  /** Read encoder and speed of M1 or M2
    * @param address address of the device
    * @note Read encoder in ticks
    * @note Read speed in ticks per second
    */
  uint32_t getEncoderDeltaM1(uint8_t *status, bool *valid);
  uint32_t getEncoderDeltaM2(uint8_t *status, bool *valid);
  int32_t ReadSpeedM1();
  int32_t ReadSpeedM2();

  void flush();
  uint32_t Read4_1(uint8_t address, uint8_t cmd, uint8_t *status, bool *valid);
  uint16_t read(int timeout = 1000);

  /** Set both encoders to zero
    * @param address address of the device
    */
  void resetEncoders();

  /** Set speed of Motor with different parameter (only in ticks)
    * @param address address of the device
    * @note Set the Speed
    * @note Set the Speed and Accel
    * @note Set the Speed and Distance
    * @note Set the Speed, Accel and Distance
    * @note Set the Speed, Accel, Decceleration and Position
    */
  void setSpeedM1(int32_t speed);
  void setSpeedM2(int32_t speed);
  void SpeedAccelM1(int32_t accel, int32_t speed);
  void SpeedAccelM2(int32_t accel, int32_t speed);
  void SpeedAccelM1M2(int32_t accel, int32_t speed1, int32_t speed2);
  void SpeedDistanceM1(int32_t speed, uint32_t distance, uint8_t buffer);
  void SpeedDistanceM2(int32_t speed, uint32_t distance, uint8_t buffer);
  void SpeedAccelDistanceM1(int32_t accel, int32_t speed, uint32_t distance, uint8_t buffer);
  void SpeedAccelDistanceM2(int32_t accel, int32_t speed, uint32_t distance, uint8_t buffer);
  void SpeedAccelDeccelPositionM1(uint32_t accel, int32_t speed, uint32_t deccel, int32_t position, uint8_t flag);
  void SpeedAccelDeccelPositionM2(uint32_t accel, int32_t speed, uint32_t deccel, int32_t position, uint8_t flag);
  void SpeedAccelDeccelPositionM1M2(uint32_t accel1, uint32_t speed1, uint32_t deccel1, int32_t position1, uint32_t accel2, uint32_t speed2, uint32_t deccel2, int32_t position2, uint8_t flag);

private:
  Serial _roboclaw;
  Timer readTimer;
  uint16_t crc;
  uint8_t address;
  void crc_clear();
  void crc_update(uint8_t data);
  uint16_t crc_get();

  void write_n(uint8_t cnt, ...);
  void write_(uint8_t command, uint8_t data, bool reading, bool crcon);

  uint16_t crc16(uint8_t *packet, int nBytes);
  uint8_t read_(void);
};

#endif