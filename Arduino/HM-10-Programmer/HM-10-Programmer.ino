#include <SoftwareSerial.h>
SoftwareSerial ble(2, 3); // RX, TX
int index = 0;
int bleindex = 0;
char inputStr[256];
char bleStr[256];
int incomingByte = 0;
void setup() {
  // Open serial port
  Serial.begin(38400);
  // begin bluetooth serial port communication
  ble.begin(38400);
}

// Now for the loop

void loop() {
        while (Serial.available() > 0) {
                // read the incoming byte:
                incomingByte = Serial.read();
                ble.write((char)incomingByte);
                Serial.print((char)incomingByte);
        }
        while (ble.available() > 0) {
                // read the incoming byte:
                incomingByte = ble.read();
                Serial.print((char)incomingByte);
        }
}

