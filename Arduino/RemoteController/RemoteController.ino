#include <math.h>

const float MID_ROLL = 2.5;
const float MID_PITCH = 2.5;
const float MID_YAW = 2.4;
const int STOP = 0;
const int IDLE = 1;
const int FLYING = 2;
const float LOW_PASS_FILTER_FACTOR = 0.45;

const int NUM_DATA=4;
const int POWER_INDEX=0;
const int ROLL_INDEX=1;
const int PITCH_INDEX=2;
const int YAW_INDEX=3;

float data[NUM_DATA];
float prevData[NUM_DATA];

char rollstr[16], pitchstr[16], yawstr[16], powerstr[16];
char jsonstr[256];

long lastSent = 0;

double lowPassFilter(double raw, double filtered)
{
    return raw * LOW_PASS_FILTER_FACTOR + filtered * (1.0 - LOW_PASS_FILTER_FACTOR);
}

bool isChanged()
{
  for (int i=0; i<NUM_DATA; i++) {
    if (data[i] != prevData[i]) {
      return true;
    }
  }
  return false;
}

void resetPreVoltage(bool setToZero)
{
  for (int i=0; i<NUM_DATA; i++) {
    prevData[i] = setToZero ? 0 : data[i];
  }
  lastSent = millis();
}

float sensorValueToVolt(float sensorValue)
{
  return round(sensorValue * 5.0 / 1023.0 * 10) / 10.0;
}

void readSensorVoltages()
{
  data[ROLL_INDEX] = sensorValueToVolt(analogRead(A0)) - MID_ROLL;
  data[PITCH_INDEX] = sensorValueToVolt(analogRead(A1)) - MID_PITCH;
  data[YAW_INDEX] = sensorValueToVolt(analogRead(A2)) - MID_YAW; 
  data[POWER_INDEX] = sensorValueToVolt(analogRead(A3));
}

void applyLowPassFilter() {
  for (int i=0; i<NUM_DATA; i++) {
    data[i] = lowPassFilter(data[i], prevData[i]);
  }
}

void sendJsonData()
{
  dtostrf(data[ROLL_INDEX], 0, 1, rollstr);
  dtostrf(data[PITCH_INDEX], 0, 1, pitchstr);
  dtostrf(data[YAW_INDEX], 0, 1, yawstr);
  dtostrf(data[POWER_INDEX], 0, 1, powerstr);
  sprintf(jsonstr, 
    "{\"state\":%d,\"roll\":%s,\"pitch\":%s,\"yaw\":%s,\"power\":%s,\"time\":%d}\n", 
    FLYING, rollstr, pitchstr, yawstr, powerstr, lastSent);
  Serial.write(jsonstr);
}

void setup()
{
  Serial.begin(115200);
  resetPreVoltage(true);
}

void loop()
{
  readSensorVoltages();
  if (isChanged() || (millis() - lastSent >= 250))
  {
    sendJsonData();
    resetPreVoltage(false);
  }
  delay(50);
}