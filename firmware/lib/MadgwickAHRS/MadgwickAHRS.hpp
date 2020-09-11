//=============================================================================================
// MadgwickAHRS.h
//=============================================================================================
//
// Implementation of Madgwick's IMU and AHRS algorithms.
// See: http://www.x-io.co.uk/open-source-imu-and-ahrs-algorithms/
//
// From the x-io website "Open-source resources available on this website are
// provided under the GNU General Public Licence unless an alternative licence
// is provided in source."
//
// Date         Author          Notes
// 29/09/2011   SOH Madgwick    Initial release
// 02/10/2011   SOH Madgwick    Optimised for reduced CPU load
//
// http://x-io.co.uk/res/doc/madgwick_internal_report.pdf
// 0.8660254037844386 * 0.0872664625997164
//
//=============================================================================================
#ifndef MADWICKAHRS_HPP
#define MADWICKAHRS_HPP

#include <math.h>

//--------------------------------------------------------------------------------------------
// Variable declaration
class MadgwickAHRS
{
private:
  static float invSqrt(float x);
  float beta; // algorithm gain
  float q0;
  float q1;
  float q2;
  float q3; // quaternion of sensor frame relative to auxiliary frame
  float invSampleFreq;
  float roll;
  float pitch;
  float yaw;
  char anglesComputed;
  void computeAngles();

  //-------------------------------------------------------------------------------------------
  // Function declarations
public:
  MadgwickAHRS(float gyroErrorDegS, float sampleFrequency);

  void setSampleFrequency(float sampleFrequency) { invSampleFreq = 1.0f / sampleFrequency; }

  void update(float gx, float gy, float gz, float ax, float ay, float az, float mx, float my, float mz);
  void updateIMU(float gx, float gy, float gz, float ax, float ay, float az);

  float getRoll()
  {
    if (!anglesComputed)
      computeAngles();
    return roll * 57.29578f;
  }

  float getPitch()
  {
    if (!anglesComputed)
      computeAngles();
    return pitch * 57.29578f;
  }

  float getYaw()
  {
    if (!anglesComputed)
      computeAngles();
    return yaw * 57.29578f + 180.0f;
  }

  float getRollRadians()
  {
    if (!anglesComputed)
      computeAngles();
    return roll;
  }

  float getPitchRadians()
  {
    if (!anglesComputed)
      computeAngles();
    return pitch;
  }

  float getYawRadians()
  {
    if (!anglesComputed)
      computeAngles();
    return yaw;
  }
};
#endif
