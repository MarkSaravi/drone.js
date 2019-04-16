/*
  ReadAnalogVoltage

  Reads an analog input on pin 0, converts it to voltage, and prints the result to the Serial Monitor.
  Graphical representation is available using Serial Plotter (Tools > Serial Plotter menu).
  Attach the center pin of a potentiometer to pin A0, and the outside pins to +5V and ground.

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/ReadAnalogVoltage
*/
float powerVoltage;
float rollVoltage;
float pitchVoltage;
float yawVoltage;

float sensorValueToVolt(int sensorValue) {
    return sensorValue * (5.0 / 1023.0);
}

void readSensorVoltages() {
    rollVoltage = sensorValueToVolt(analogRead(A0));
    pitchVoltage = sensorValueToVolt(analogRead(A1));
    yawVoltage = sensorValueToVolt(analogRead(A2));
    powerVoltage = sensorValueToVolt(analogRead(A3));
}

void sendJsonData() {
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

void setup() {
  Serial.begin(9600);
}

void loop() {
  readSensorVoltages();
  sendJsonData();
  delay(100);
}