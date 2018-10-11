//*** ESC Controller by Mark Saravi ***

#include <Wire.h>
#include <Adafruit_PWMServoDriver.h>

typedef enum JsonErrors
{
    NoError,
    MissingStart,
    MissingEnd,
    MissingComma,
    LengthError,
    KeyError,
    MissingDoubleQouteError,
    MissingColon,
    MissingValueError
} JsonErrors;

JsonErrors readJsonKeyValue(const char *json, int *sIndex, char key, double *value);
JsonErrors readJson(const char *json, double *a, double *b, double *c, double *d);

//#define SHOW_DEBUG_INFO

const long SERIAL_PORT_SPEED = 115200;

const double ARMING_MAX_PULSEWIDTH = 0.001900; //seconds
const double ARMING_MIN_PULSEWIDTH = 0.001100; //seconds
const double FREQ = 480.0;
const double PERIOD = 1.0 / FREQ;
const int PWM_COUNTER = 4096;

const double SPEED_FACTOR = 0.5;
const double MAX_SPEED = 100.0;

const int BATTERY_PIN = 0;
const int NUM_MOTORS = 4;

double currSpeeds[NUM_MOTORS];

Adafruit_PWMServoDriver pwm = Adafruit_PWMServoDriver(0x40);

bool isArmed = false;

void sendDeviceType()
{
    static long lastIdentifier = millis();
    if (millis() - lastIdentifier >= 500)
    {
        lastIdentifier = millis();
        Serial.println("{\"dev\":\"esc\"}");
    }
}

void initSpeeds()
{
    for (int i = 0; i < NUM_MOTORS; i++)
    {
        currSpeeds[i] = 0; //force to send first 0
    }
}

void setup()
{
    Serial.begin(SERIAL_PORT_SPEED);
    Serial.println("{\"info\":\"ESC controller started\"}");
    pwm.begin();
    pwm.setPWMFreq(FREQ); // This is the maximum PWM frequency
    isArmed = false;
    initSpeeds();
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

double validateSpeed(double ps, double cs)
{
    if (cs < 0 || cs > MAX_SPEED)
        return ps;
    return cs;
}

void applySpeed(int index)
{
    setEscPulseWidth(index, currSpeeds[index] * SPEED_FACTOR / 100 * (ARMING_MAX_PULSEWIDTH - ARMING_MIN_PULSEWIDTH) + ARMING_MIN_PULSEWIDTH);
}

void applySpeeds()
{
    for (int i = 0; i < NUM_MOTORS; i++)
    {
        applySpeed(i);
    }
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
            if (connected)
            {
                Serial.println("{\"warning\":\"waiting to connect the battery\"}");
            }
            else
            {
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
    const int CMD_MAX_LEN = 128;
    static char cmdJson[CMD_MAX_LEN];
    static int counter = 0;
    static double a, b, c, d;
    static JsonErrors err;
    static char incomingByte;
    while (Serial.available())
    {
        incomingByte = Serial.read();
        if (incomingByte == 10 || incomingByte == 13 || incomingByte==' ') continue;
        if (counter >= CMD_MAX_LEN)
            counter = 0;
        cmdJson[counter] = incomingByte;
        if (cmdJson[counter] == '}')
        {
            cmdJson[counter + 1] = NULL;
            Serial.println(cmdJson);
            err = readJson(cmdJson, &a, &b, &c, &d);
            if (err == NoError)
            {
                currSpeeds[0] = validateSpeed(currSpeeds[0], a);
                currSpeeds[1] = validateSpeed(currSpeeds[1], b);
                currSpeeds[2] = validateSpeed(currSpeeds[2], c);
                currSpeeds[3] = validateSpeed(currSpeeds[3], d);
                applySpeeds();
            }
            else
            {
                Serial.println(err);
            }
            counter = 0;
        } 
        else 
        {
            counter++;
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

JsonErrors readJsonKeyValue(const char *json, int *sIndex, char key, double *value)
{
    int startIndex = *sIndex;
    char buffer[32];
    char k = json[startIndex + 1];
    char dq = json[startIndex + 2];
    char colon = json[startIndex + 3];
    if (k != key)
    {
        return KeyError;
    }
    if (dq != '"')
        return MissingDoubleQouteError;
    if (colon != ':')
        return MissingColon;
    startIndex += 4;
    int endIndex = startIndex;
    while ((json[endIndex] >= '0' && json[endIndex] <= '9') || json[endIndex] == '.')
        endIndex++;
    if (endIndex == startIndex || (endIndex - startIndex) > 20)
        return MissingValueError;
    memcpy(buffer, json + startIndex, endIndex - startIndex);
    buffer[endIndex - startIndex] = (char)NULL;
    *value = atof(buffer);
    *sIndex = endIndex;
    return NoError;
}

JsonErrors readJson(const char *json, double *a, double *b, double *c, double *d)
{
    int index = 1;
    double value;
    double values[4];
    const char sep[] = {',', ',', ',', '}'};
    const char keys[] = {'a', 'b', 'c', 'd'};

    int len = strlen(json);
    if (len < 25)
        return LengthError;
    if (json[0] != '{')
        return MissingStart;
    if (json[len - 1] == '\n')
        len--;
    if (json[len - 1] != '}')
        return MissingEnd;
    JsonErrors err = NoError;

    for (int i = 0; i < 4; i++)
    {
        err = readJsonKeyValue(json, &index, keys[i], &value);
        if (err != NoError)
            return err;
        if (json[index] != sep[i])
            return MissingComma;
        index++;
        values[i] = value;
    }
    *a = values[0];
    *b = values[1];
    *c = values[2];
    *d = values[3];
    return err;
}
