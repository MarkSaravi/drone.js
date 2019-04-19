#include <math.h>

const float MID_ROLL = 2.5;
const float MID_PITCH = 2.5;
const float MID_YAW = 2.4;

float powerVoltage;
float rollVoltage;
float pitchVoltage;
float yawVoltage;

float prePowerVoltage = 0;
float preRollVoltage = 0;
float prePitchVoltage = 0;
float preYawVoltage = 0;

long lastSent = 0;

bool isChanged()
{
  return preRollVoltage != rollVoltage ||
         prePitchVoltage != pitchVoltage ||
         preYawVoltage != yawVoltage ||
         prePowerVoltage != powerVoltage;
}

void resetPreVoltage()
{
  preRollVoltage = rollVoltage;
  prePitchVoltage = pitchVoltage;
  preYawVoltage = yawVoltage;
  prePowerVoltage = powerVoltage;
  lastSent = millis();
}

float sensorValueToVolt(int sensorValue)
{
  return round(sensorValue * 5.0 / 1023.0 * 10) / 10.0;
}

void readSensorVoltages()
{
  rollVoltage = sensorValueToVolt(analogRead(A0)) - MID_ROLL;
  pitchVoltage = sensorValueToVolt(analogRead(A1)) - MID_PITCH;
  yawVoltage = sensorValueToVolt(analogRead(A2)) - MID_YAW;
  powerVoltage = sensorValueToVolt(analogRead(A3));
}

void sendJsonData()
{
  Serial.print("{\"roll\":");
  Serial.print(rollVoltage);
  Serial.print(",\"pitch\":");
  Serial.print(pitchVoltage);
  Serial.print(",\"yaw\":");
  Serial.print(yawVoltage);
  Serial.print(",\"power\":");
  Serial.print(powerVoltage);
  Serial.println("}");
}

void setup()
{
  Serial.begin(9600);
}

void loop()
{
  readSensorVoltages();
  if (isChanged() || (millis() - lastSent >= 200))
  {
    sendJsonData();
    resetPreVoltage();
  }
}