#ifndef MBED_LIDAR_H
#define MBED_LIDAR_H

#include <mbed.h>

class Lidar
{

public:
  /** Create an LIDAR object connected to the specified serial port and
     *  PWM port for LIDAR motor control
     *
     * @param tx Transmit pin
     * @param rx Receive Pin
     * @param motor_pwm PWM pin for motor control
     *
     * @note
     *   The LIDAR will be initiated with 1kHz PWM with 0% duty-cycle
     *   and 115200 baud (standard baud for NEATO LIDAR)
     */
  Lidar(PinName tx, PinName rx, PinName motor_pwm);

  /** Start data aquisition after setting up other initial parameter
     *  such as motor duty cycle and period.
     *
     * @note
     *   This function will activate Rx interrupt each time data is received
     */
  void StartData(void);

  /** Stop data aquisition
     *
     * @note
     *   This function will deactivate Rx Interrupt
     */
  void StopData(void);

  /** Set the PWM duty cycle precentage for LIDAR motor
     *
     * @param duty The duty cycle ranged from 0.0(0%) to 1.0(100%)
     *
     */
  void SetPWMDuty(float duty);

  /** Set the PWM duty cycle for LIDAR motor in microseconds. The
     *  generated frequency will be f = 1000000/period
     *
     * @param microseconds The PWM period in microseconds
     *
     */
  void SetPWMPeriodUs(int microseconds);

  /** Obtain the distance data read by LIDAR in certain angle
     *
     * @param degree The angle where the data want to be read, it is integer ranged from 0-359
     *
     * @return Distance data in cm
     */
  float GetData(int degree);

  /** Obtain the rotation speed of LIDAR motor
     *
     * @return Speed data in rpm
     */
  // float GetSpeed(void);

  float getRpm();

  void update();

private:
  Serial _lidar;
  PwmOut _motor;

  short _data[360];
  char *_data_ptr;
  unsigned short _speed;
  char *_speed_ptr;

  char _fsm_state;
  char _fsm_count;
  unsigned short _fsm_angle;

  // void data_parser(void);

  void handleSerialRx();
  uint8_t eValidatePacket();
  uint16_t processIndex();
  void processSpeed();
  uint8_t processDistance(int iQuad);
  void processSignalStrength(int iQuad);

  static const unsigned char COMMAND = 0xFA; // Start of new packet
  static const int OFFSET_TO_START = 0;
  static const int OFFSET_TO_INDEX = OFFSET_TO_START + 1;
  static const int OFFSET_TO_SPEED_LSB = OFFSET_TO_INDEX + 1;
  static const int OFFSET_TO_SPEED_MSB = OFFSET_TO_SPEED_LSB + 1;
  static const int OFFSET_TO_4_DATA_READINGS = OFFSET_TO_SPEED_MSB + 1;
  static const int N_DATA_QUADS = 4;        // there are 4 groups of data elements
  static const int N_ELEMENTS_PER_QUAD = 4; // viz., 0=distance LSB; 1=distance MSB; 2=sig LSB; 3=sig MSB
  static const int OFFSET_TO_CRC_L = OFFSET_TO_4_DATA_READINGS + (N_DATA_QUADS * N_ELEMENTS_PER_QUAD);
  static const int OFFSET_TO_CRC_M = OFFSET_TO_CRC_L + 1;
  static const int PACKET_LENGTH = OFFSET_TO_CRC_M + 1; // length of a complete packet
  static const int OFFSET_DATA_DISTANCE_LSB = 0;
  static const int OFFSET_DATA_DISTANCE_MSB = OFFSET_DATA_DISTANCE_LSB + 1;
  static const int OFFSET_DATA_SIGNAL_LSB = OFFSET_DATA_DISTANCE_MSB + 1;
  static const int OFFSET_DATA_SIGNAL_MSB = OFFSET_DATA_SIGNAL_LSB + 1;
  static const int VALID_PACKET = 0;
  static const int INVALID_PACKET = VALID_PACKET + 1;
  static const int INDEX_LO = 0xA0; // lowest index value
  static const int INDEX_HI = 0xF9; // highest index value
  static const uint8_t INVALID_DATA_FLAG = (1 << 7);
  static const uint8_t STRENGTH_WARNING_FLAG = (1 << 6);
  static const uint8_t BAD_DATA_MASK = (INVALID_DATA_FLAG | STRENGTH_WARNING_FLAG);

  const uint8_t eState_Find_COMMAND = 0;                       // 1st state: find 0xFA (COMMAND) in input stream
  const uint8_t eState_Build_Packet = eState_Find_COMMAND + 1; // 2nd state: build the packet
  int eState = eState_Find_COMMAND;
  int Packet[PACKET_LENGTH]; // an input packet
  int ixPacket = 0;
  bool ledState = 0;
  uint16_t startingAngle = 0;
  int8_t motor_rph_high_byte = 0;
  uint8_t motor_rph_low_byte = 0;
  uint16_t motor_rph = 0;
  double motor_rpm;
  uint8_t aryInvalidDataFlag[N_DATA_QUADS] = {0, 0, 0, 0}; // non-zero = INVALID_DATA_FLAG or STRENGTH_WARNING_FLAG is set
  uint16_t aryDist[N_DATA_QUADS] = {0, 0, 0, 0};           // thre are (4) distances, one for each data quad
  uint16_t aryQuality[N_DATA_QUADS] = {0, 0, 0, 0};        // same with 'quality'
  bool show_dist = false;
  bool show_errors = true;
  bool show_rpm = false;
  float pwm_val = 0.0f;
};

#endif