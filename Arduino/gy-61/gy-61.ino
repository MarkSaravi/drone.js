
#include <GY_61.h>

GY_61 accel;

void setup() {
    accel = GY_61(A0, A1, A2);
    Serial.begin(9600);
}

double x,y,z,t;
void loop() {
  //Serial.print("X = ");
  //Serial.println(accel.readx());
  //Serial.print(" Y = ");
  //Serial.println(accel.ready());
  //Serial.print(" Z = ");
  //Serial.println(accel.readz());
  //Serial.print(" Ac. Total");
  //Serial.println(accel.acceltol());

  x = accel.readx();
  y = accel.ready();
  z = accel.readz();
  t = accel.acceltol();
  Serial.print("{\"x\":");
  Serial.print(x);
  Serial.print(",\"y\":");
  Serial.print(y);
  Serial.print(",\"z\":");
  Serial.print(z);
  Serial.print(",\"t\":");
  Serial.print(t);
  Serial.println("}");
}
