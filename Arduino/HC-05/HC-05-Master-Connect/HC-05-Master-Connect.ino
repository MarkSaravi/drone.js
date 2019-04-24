#include <SoftwareSerial.h>
SoftwareSerial BTserial(10, 11);

int state = 0;
const int ledPin = 8;  //the pin your led is connected to
const int buttonPin = 2;  //the pin your button is connected to

int buttonState = 0;

void setup() {

  Serial.begin(57600);
  BTserial.begin(57600);

  pinMode(ledPin, OUTPUT);
  pinMode(buttonPin, INPUT);

}
int counter=0;
float value = 0;
char msg[128];
char valuestr[64];
void loop() {
    dtostrf(value, 0, 2, valuestr);
    sprintf(msg, "{\"#\":%d,\"roll\":%s,\"pitch\":%s,\"yaw\":%s,\"power\":%s,}\n", counter++, valuestr, valuestr, valuestr, valuestr);
    value += 0.1;
    BTserial.write(msg);  //sends a 1 through the bluetooth serial link
    Serial.print(msg);
    delay (20);
}
