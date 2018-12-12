#ifndef MBED_LIDAR_H
#define MBED_LIDAR_H

#include <mbed.h>
#include <queue>

#include <PID.h>

class Lidar
{

public:
  // represents a lidar measurement
  struct Measurement
  {
    int angle = -1;
    int distance = -1;
    int quality = -1;
    bool isInvalid = true;
    bool isWeak = true;
  };

  Lidar(PinName txPin, PinName rxPin, PinName motorPwmPin, float pidP = 1.0f, float pidI = 0.5f, float pidD = 0.01f, int pidIntervalMs = 10, float startupPwm = 0.3f);

  bool isRunning();
  bool isValid();

  void start(float targetRpm = 300.0f);
  void stop();
  void setTargetRpm(float targetRpm);
  float getTargetRpm() { return targetRpm; }
  float getCurrentRpm();

  float getMotorPwm();

  int getRunningDurationMs() { return runningTimer.read_ms(); }

  int getTotalMeasurementCount() { return receivedMeasurementCount; }
  int getInvalidMeasurementCount() { return invalidMeasurementCount; }
  int getWeakMeasurementCount() { return weakMeasurementCount; }
  int getOutOfOrderMeasurementCount() { return outOfOrderMeasurementCount; }
  Measurement *getMeasurement(int number);

  int getRotationCount() { return rotationCount; }

  // 360 measurements per rotation, running at 300 RPM (5Hz) that's 1800 measurements per second
  static const int MEASUREMENT_BUFFER_SIZE = 180; // enough for 100ms (10 FPS)

private:
  // motor speed is controlled internally by the PID controller
  void setMotorPwm(float duty);

  // packet parsing utilities
  void handleSerialRx();
  void handleWaitForStartByte(uint8_t inByte);
  void handleBuildPacket(uint8_t inByte);
  void handleRotationComplete();
  void processPacket();
  void processDistance(int iQuad);
  void processSignalStrength(int iQuad);
  int getPacketStartAngle();
  void resetPacket();
  bool isPacketValid();

  // dependencies
  Serial serial;
  PwmOut motorPwm;
  Measurement measurements[MEASUREMENT_BUFFER_SIZE]; // circular measurements buffer
  PID motorPid;

  // timers
  Timer rotationTimer;
  Timer runningTimer;

  // configuration set by the constructor
  int pidIntervalMs;
  float startupPwm;

  // packet parsing configuration
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
  static const uint8_t PACKET_START_BYTE = 0xFA;
  static const uint8_t INVALID_DATA_FLAG = (1 << 7);
  static const uint8_t STRENGTH_WARNING_FLAG = (1 << 6);
  static const uint8_t BAD_DATA_MASK = (INVALID_DATA_FLAG | STRENGTH_WARNING_FLAG);

  // packet parser state machine states
  enum State
  {
    WAIT_FOR_START_BYTE,
    BUILD_PACKET
  };

  // runtime state
  bool running = false;
  int packetErrorCount = 0;
  volatile int receivedMeasurementCount = 0;
  int invalidMeasurementCount = 0;
  int weakMeasurementCount = 0;
  int outOfOrderMeasurementCount = 0;
  int rotationCount = 0;
  float motorPwmDuty = 0.0f;
  float targetRpm = 0.0f;
  float currentMotorRpm = 0.0f;
  int expectedRotationDurationMs = 0;
  int lastRotationDurationMs = 0;
  int lastMeasurementAngle = -1;
  State state = WAIT_FOR_START_BYTE;
  int packetByteIndex = 0;
  int packet[PACKET_LENGTH];
  uint8_t packetInvalidFlag[N_DATA_QUADS] = {0, 0, 0, 0};
  uint16_t packetDistance[N_DATA_QUADS] = {0, 0, 0, 0};
  uint16_t packetSignalStrength[N_DATA_QUADS] = {0, 0, 0, 0};
};

#endif