#ifndef MBED_LIDAR_H
#define MBED_LIDAR_H

#include <mbed.h>

#include <queue>

class LidarMeasurement
{
public:
  int angle;
  int distance;
  int quality;
  bool isValid;
  bool isStrong;

  LidarMeasurement(int angle, int distance, int quality, bool isValid, bool isStrong) : angle(angle),
                                                                                        distance(distance),
                                                                                        quality(quality), isValid(isValid),
                                                                                        isStrong(isStrong) {}
};

typedef std::queue<LidarMeasurement *> MeasurementsQueue;

class Lidar
{

public:
  Lidar(PinName txPin, PinName rxPin, PinName motorPwmPin);

  bool isStarted();
  bool isValid();

  void setTargetRpm(int targetRpm);
  int getRpm();

  unsigned int getQueuedMeasurementCount();
  LidarMeasurement *popQueuedMeasurement();

  // void update();

private:
  void setMotorPwm(float duty);
  void handleSerialRx();
  void processWaitingForStartByte(uint8_t inByte);
  void processBuildPacket(uint8_t inByte);
  void processPacket();
  uint16_t processIndex();
  void processRpm();
  uint8_t processDistance(int iQuad);
  void processSignalStrength(int iQuad);

  void resetPacket();
  bool isPacketValid();

  Serial serial;
  PwmOut motorPwm;
  Timer cycleTimer;
  MeasurementsQueue measurementsQueue;

  static const uint8_t PACKET_START_BYTE = 0xFA;

  static const int N_DATA_QUADS = 4;
  static const int N_ELEMENTS_PER_QUAD = 4;
  static const int MAX_LIDAR_MEASUREMENTS_QUEUE_LENGTH = 360;

  static const int OFFSET_TO_START = 0;
  static const int OFFSET_TO_INDEX = OFFSET_TO_START + 1;
  static const int OFFSET_TO_SPEED_LSB = OFFSET_TO_INDEX + 1;
  static const int OFFSET_TO_SPEED_MSB = OFFSET_TO_SPEED_LSB + 1;
  static const int OFFSET_TO_4_DATA_READINGS = OFFSET_TO_SPEED_MSB + 1;
  static const int OFFSET_TO_CRC_L = OFFSET_TO_4_DATA_READINGS + (N_DATA_QUADS * N_ELEMENTS_PER_QUAD);
  static const int OFFSET_TO_CRC_M = OFFSET_TO_CRC_L + 1;
  static const int OFFSET_DATA_DISTANCE_LSB = 0;
  static const int OFFSET_DATA_DISTANCE_MSB = OFFSET_DATA_DISTANCE_LSB + 1;
  static const int OFFSET_DATA_SIGNAL_LSB = OFFSET_DATA_DISTANCE_MSB + 1;
  static const int OFFSET_DATA_SIGNAL_MSB = OFFSET_DATA_SIGNAL_LSB + 1;
  static const int PACKET_LENGTH = OFFSET_TO_CRC_M + 1;

  static const int INDEX_LO = 0xA0;
  static const int INDEX_HI = 0xF9;

  static const uint8_t INVALID_DATA_FLAG = (1 << 7);
  static const uint8_t STRENGTH_WARNING_FLAG = (1 << 6);
  static const uint8_t BAD_DATA_MASK = (INVALID_DATA_FLAG | STRENGTH_WARNING_FLAG);

  enum State
  {
    WAITING_FOR_START_BYTE,
    BUILDING_PACKET
  };

  bool isRunning = false;
  bool wasLastPacketValid = false;

  State state = BUILDING_PACKET;
  int packet[PACKET_LENGTH];
  int packetByteIndex = 0;
  uint16_t packetStartAngle = 0;
  uint8_t packetInvalidFlag[N_DATA_QUADS] = {0, 0, 0, 0};
  uint16_t packetDistance[N_DATA_QUADS] = {0, 0, 0, 0};
  uint16_t packetSignalStrength[N_DATA_QUADS] = {0, 0, 0, 0};
  float motorPwmDuty = 0.0f;
  int targetRpm = 250;
  int lastMotorRpm = 0;
  int expectedCycleDuration = 0;
};

#endif