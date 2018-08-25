#include <SoftwareSerial.h>
SoftwareSerial ble(2, 3); // RX, TX
int counter = 0;
long lastSend = 0;
int index = 0;
char inputStr[256];
void setup() {
  // Open serial port
  Serial.begin(115200);
  // begin bluetooth serial port communication
  ble.begin(9600);
}

// Now for the loop

void loop() {
  if (millis()-lastSend>=500) {
    Serial.println("Sending Bluetooth Message...");
    char buffer[64];
    sprintf(buffer, "%s%d", "Testing: ", counter++);
    ble.write(buffer);
    lastSend = millis();
  }
  while (ble.available()>0) {
    char c =  ble.read();
    if (c=='\n') {
      Serial.println(inputStr);
      index=0;
    }else{
      inputStr[index++] = ble.read();
      inputStr[index] = NULL;
    }
  }
}

