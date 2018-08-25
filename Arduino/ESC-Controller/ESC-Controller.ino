//*** ESC Controller by Mark Saravi ***

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

//#define SHOW_DEBUG_INFO

const long SERIAL_PORT_SPEED = 115200;

const double ARMING_MAX_PULSEWIDTH = 0.001968; //seconds
const double ARMING_MIN_PULSEWIDTH = 0.001024; //seconds
const double FREQ = 480.0;
const double PERIOD = 1.0 / FREQ;
const int PWM_COUNTER = 4096;

const double SPEED_FACTOR = 0.25;
const double MAX_SPEED = 100.0;
const double SAFE_SPEED_CHANGE = -30.0;

const int BATTERY_PIN = 0;
const int NUM_MOTORS = 4;

const int SPEED_APPLY_DELAY = 1; //milli seconds

double currSpeeds[NUM_MOTORS];
double prevSpeeds[NUM_MOTORS];

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

int motorIndex = 0; //motor A has index 0
int numBytes;

bool isArmed = false;

double inoutSpeed = 0;
double currValue = 0;
int currDecimalPlace = 0;
bool hasDecimal = false;
long lastIdentifier = millis();

void sendDeviceType() {
    if (millis() - lastIdentifier >= 500) {
        lastIdentifier = millis();
        Serial.println("{\"dev\":\"esc\"}");
    }
}

void syncSpeeds()
{
    for (int i = 0; i < NUM_MOTORS; i++)
    {
        prevSpeeds[i] = currSpeeds[i];
    }
}

void initSpeeds()
{
    for (int i = 0; i < NUM_MOTORS; i++)
    {
        currSpeeds[i] = 0; //force to send first 0
    }
    syncSpeeds();
}

void setup()
{
    Serial.begin(SERIAL_PORT_SPEED);
    Serial.println("{\"info\":\"ESC controller started\"}");
    // Serial.println(FREQ);
    // Serial.println(PERIOD * 1000);
    pwm.begin();
    pwm.setPWMFreq(FREQ); // This is the maximum PWM frequency
    isArmed = false;
    initSpeeds();
    motorIndex = -1;
}

void setEscPulseWidth(int index, double pw)
{
    int ontime = (int)((double)pw / PERIOD * PWM_COUNTER);
    pwm.setPWM(index * 4, 0, ontime);
#ifdef SHOW_DEBUG_INFO
    Serial.print("motor ");
    Serial.print(index);
    Serial.print(": ");
    Serial.println(pw * 1000000.0);
#endif
}

void validateSpeeds()
{
    for (int i = 0; i < NUM_MOTORS; i++)
    {
        double speed = currSpeeds[i];
        speed = speed <= MAX_SPEED ? speed : MAX_SPEED;
        speed = speed >= 0 ? speed : 0;
        currSpeeds[i] = speed;
    }
}

void applySpeed(int index)
{
    setEscPulseWidth(index, currSpeeds[index] * SPEED_FACTOR / 100 * (ARMING_MAX_PULSEWIDTH - ARMING_MIN_PULSEWIDTH) + ARMING_MIN_PULSEWIDTH);
}

int getNumSteps()
{
    double maxSpeedReduce = 0, d=0; //looking for max negative
    for (int i = 0; i < NUM_MOTORS; i++)
    {
        d = (currSpeeds[i] - prevSpeeds[i]);
        if (d < maxSpeedReduce) {
            maxSpeedReduce = d;
        }
    }
    if (maxSpeedReduce < SAFE_SPEED_CHANGE)
    {
        return (int)-maxSpeedReduce;
    }
    return 1;
}

void safeChangeMotors()
{
    bool next = true;
    double dSpeeds[NUM_MOTORS];
    int numSteps = getNumSteps();

    for (int i = 0; i < NUM_MOTORS; i++)
    {
        dSpeeds[i] = (currSpeeds[i] - prevSpeeds[i]) / numSteps;
        currSpeeds[i] = prevSpeeds[i];
    }

    for (int step = 0; step < numSteps; step++)
    {
        for (int i = 0; i < NUM_MOTORS; i++)
        {
            currSpeeds[i] += dSpeeds[i];
            applySpeed(i);
        }
        if (numSteps > 1)
            delay(SPEED_APPLY_DELAY);
    }
}

void applySpeeds()
{
    validateSpeeds();
    safeChangeMotors();
    syncSpeeds();
}

void setAllEscPulseWidth(double pw)
{
    for (int i = 0; i < NUM_MOTORS; i++)
    {
        setEscPulseWidth(i, pw);
    }
}

bool waitForArming(int armingTime)
{
    long start = millis();
    while (millis() - start < armingTime)
    {
        if (!isBatteryConnected())
        {
            Serial.println("{\"info\":\"abort arming\"}");
            return false;
        }
    }
    return true;
}

void waitForBatteryState(bool connected)
{
    long lastMessage = millis();
    while (isBatteryConnected() != connected) //making sure that ESC is not armed already
    {
        sendDeviceType();
        if (millis() - lastMessage > 2000)
        {
            lastMessage = millis();
            if (connected) {
                Serial.println("{\"warning\":\"waiting to connect the battery\"}");
            }
            else {
                Serial.println("{\"warning\":\"waiting to disconnect the battery\"}");
            }
        }
    }
}

void arm()
{
    waitForBatteryState(false);
    setAllEscPulseWidth(ARMING_MAX_PULSEWIDTH);
    waitForBatteryState(true);
    Serial.println("{\"info\":\"start arming\"}");
    Serial.println("{\"info\":\"applying max pulse width\"}");
    if (waitForArming(4000))
    {
        Serial.println("{\"info\":\"applying min pulse width\"}");
        Serial.println("{\"info\":\"waiting for arming\"}");
        setAllEscPulseWidth(ARMING_MIN_PULSEWIDTH);
        if (waitForArming(10000))
        {
            Serial.println("{\"info\":\"end arming\"}");
            clearInputBuffer();
            isArmed = true;
        }
    }
}

bool isBatteryConnected()
{
    float inputVoltage = analogRead(BATTERY_PIN) * 5.0 / 1023;
    return inputVoltage > 3.0;
}

void clearInputBuffer()
{
    while (Serial.available() > 0)
    {
        char t = Serial.read(); //clearing the serial buffer
    }
}

void readCommand()
{
    numBytes = Serial.available();
    for (int i = 0; i < numBytes; i++)
    {
        int incomingByte = Serial.read();
        switch (incomingByte)
        {
        case '\n':
            applySpeeds();
            motorIndex = -1; //safety after applying speeds
            break;
        case 'e':
            for (int i = 0; i < NUM_MOTORS; i++)
            {
                currSpeeds[i] = 0;
            }
            applySpeeds();
            break;
        case ',':
            motorIndex++;
            break;
        case 'a':
        case 'b':
        case 'c':
        case 'd':
        case 'g':
            motorIndex = incomingByte - 'a';
            //Serial.print("Motor Index: ");
            //Serial.println(motorIndex);
            inoutSpeed = 0;
            hasDecimal = false;
            currDecimalPlace = 1;
            break;
        case '.':
            hasDecimal = true;
            break;
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
            if (motorIndex < 0) //if not a,b,c,d,g
                break;
            if (inoutSpeed < 10000)
            {
                inoutSpeed = inoutSpeed * 10 + incomingByte - '0';
                if (hasDecimal)
                    currDecimalPlace = currDecimalPlace * 10;
                currValue = inoutSpeed / currDecimalPlace;
            }

            if (motorIndex < NUM_MOTORS && motorIndex >= 0)
            { //g char
                currSpeeds[motorIndex] = currValue;
            }
            if (motorIndex == 6) //g char
            {
                for (int i = 0; i < NUM_MOTORS; i++)
                {
                    currSpeeds[i] = currValue;
                }
            }

            break;
        }
    }
}

void loop()
{
    sendDeviceType();
    if (!isBatteryConnected())
        isArmed = false;
    if (isArmed)
    {
        readCommand();
    }
    else
    {
        arm();
    }
}