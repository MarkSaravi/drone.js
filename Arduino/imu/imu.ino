// MPU-6050 Short Example Sketch
// By Arduino User JohnChi
// August 17, 2014
// Public Domain
#include <Wire.h>

const int MPU_addr = 0x68; // I2C address of the MPU-6050
const float alpha = 0.45;

int16_t AcX, AcY, AcZ, Tmp, GyX, GyY, GyZ;
double xg, yg, zg, xds, yds, zds;
double fXg = 0;
double fYg = 0;
double fZg = 0;

double roll = 0, pitch = 0, yaw = 0;
long prevMicroTime;
long currMicroTime;
long prevMilliTime;
long currMilliTime;

void setup()
{
    Wire.begin();
    Wire.beginTransmission(MPU_addr);
    Wire.write(0x6B); // PWR_MGMT_1 register
    Wire.write(0);    // set to zero (wakes up the MPU-6050)
    Wire.endTransmission(true);
    Serial.begin(9600);
    prevMicroTime = micros();
    prevMilliTime = millis();
}

void loop()
{
    Wire.beginTransmission(MPU_addr);
    Wire.write(0x3B); // starting with register 0x3B (ACCEL_XOUT_H)
    Wire.endTransmission(false);
    Wire.requestFrom(MPU_addr, 14, true); // request a total of 14 registers
    AcX = Wire.read() << 8 | Wire.read(); // 0x3B (ACCEL_XOUT_H) & 0x3C (ACCEL_XOUT_L)
    AcY = Wire.read() << 8 | Wire.read(); // 0x3D (ACCEL_YOUT_H) & 0x3E (ACCEL_YOUT_L)
    AcZ = Wire.read() << 8 | Wire.read(); // 0x3F (ACCEL_ZOUT_H) & 0x40 (ACCEL_ZOUT_L)
    Tmp = Wire.read() << 8 | Wire.read(); // 0x41 (TEMP_OUT_H) & 0x42 (TEMP_OUT_L)
    GyX = Wire.read() << 8 | Wire.read(); // 0x43 (GYRO_XOUT_H) & 0x44 (GYRO_XOUT_L)
    GyY = Wire.read() << 8 | Wire.read(); // 0x45 (GYRO_YOUT_H) & 0x46 (GYRO_YOUT_L)
    GyZ = Wire.read() << 8 | Wire.read(); // 0x47 (GYRO_ZOUT_H) & 0x48 (GYRO_ZOUT_L)
                                          //   Serial.print("AcX = "); Serial.print(AcX);
                                          //   Serial.print(" | AcY = "); Serial.print(AcY);
                                          //   Serial.print(" | AcZ = "); Serial.print(AcZ);
                                          //   Serial.print(" | Tmp = "); Serial.print(Tmp/340.00+36.53);  //equation for temperature in degrees C from datasheet
                                          //   Serial.print(" | GyX = "); Serial.print(GyX);
                                          //   Serial.print(" | GyY = "); Serial.print(GyY);
                                          //   Serial.print(" | GyZ = "); Serial.println(GyZ);
    xg = AcX * 0.0039;
    yg = AcY * 0.0039;
    zg = AcZ * 0.0039;
    fXg = xg * alpha + (fXg * (1.0 - alpha));
    fYg = yg * alpha + (fYg * (1.0 - alpha));
    fZg = zg * alpha + (fZg * (1.0 - alpha));
    xg = fXg;
    yg = fYg;
    zg = fZg;
    roll = atan2(yg, zg) * 180 / PI;
    pitch = atan2(-xg, sqrt(yg * yg + zg * zg)) * 180 / PI;

    xds = GyX / 14.375;
    yds = GyY / 14.375;
    zds = GyZ / 14.375;
    currMicroTime = micros();
    yaw += zds * (currMicroTime-prevMicroTime)/1000 * -0.001;
    prevMicroTime = currMicroTime;
    currMilliTime=millis();
    if (currMilliTime-prevMilliTime>=100){
        prevMilliTime=currMilliTime;
        Serial.print("roll = ");
        Serial.print(roll);
        Serial.print(" | pitch = ");
        Serial.print(pitch);
        Serial.print(" | yaw = ");
        Serial.println(yaw);
    }
}