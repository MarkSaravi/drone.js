#include <string.h>
class SimpleJsonReader 
{
  private:
    char json[128];
    int startIndex;
    int endIndex;
    int index;
    char key[64];
  private:
  bool readKey();
  bool isValidKeyChar(char c);
  bool isNumChar(char c);
};

bool SimpleJsonReader::isValidKeyChar(char c) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

bool SimpleJsonReader::isNumChar(char c) {
  return (c >= '0' && c<='9') || c == '.' || c == '-' || c == '+';
}

bool SimpleJsonReader::readKey() {
  index++;
  endIndex = index;
  startIndex = index;
  int i = 0;
  while (json[index] != NULL && json[index] != '"') { 
    if (!isValidKeyChar(json[index])) retuen false;
    key[i++] = json[index++];
  }
  if (json[index] != '"') return false;
  endIndex = index;
  return true;
}

bool SimpleJsonReader::readValue() {
  endIndex = index;
  if (json[index] == NULL || json[index] == ',') return false;
  index++;
  startIndex = index;
  while (true) {
    if (json[index] == NULL) return false;
    if (json[index] != '"') 
    {
      endIndex = index;
      index++;
    } else {
      index++;
      break;
    }
  }
  if (startIndex > endIndex) return false;
  return true;
}

void setup()
{
  // put your setup code here, to run once:
  Serial.begin(38400);
}

bool readJsonInput(char *json)
{
  const int BUFFER_SIZE = 256;
  static char incomingString[BUFFER_SIZE];
  static int incomingIndex = 0;
  static int incomingChar;
  while (Serial.available() > 0)
  {
    incomingChar = Serial.read();
    if (incomingChar == ' ' || incomingChar == 10)
      continue;
    incomingString[incomingIndex++] = (char)incomingChar;
    incomingString[incomingIndex] = NULL;
    if (incomingIndex >= BUFFER_SIZE)
    {
      incomingIndex = 0;
      incomingString[incomingIndex] = NULL;
    }
    if ((char)incomingChar == '}')
    {
      incomingIndex = 0;
      strcpy(json, incomingString);
      return true;
    }
  }
  return false;
}

void showJsonError(int state, const char *msg)
{
  Serial.print(state);
  Serial.print(": ");
  Serial.println(msg);
}

int readJsonKey(const char *json, int index) {
  int start = index + 1;
  int end = start;
  if (json[index] == NULL || json[index]!='"') return -1;
  while (json[index]!=NULL) {
    if (json[index]=='"') {
      end = index - 1;
      break;
    }
    index++;
  }
  if (json[index]!='"') return -1;
}

bool parseJson(char *json)
{
  enum JsonState
  {
    none = 0,
    jsonbegin = 1,
    key = 2,
    colon = 3,
    value = 4,
    next = 5,
    jsonend = 6
  };
  int index = 0;
  JsonState state = none;

  

  while (json[index] != NULL)
  {
    char c = json[index];
    if (c == '{')
    {
      if (state != none)
      {
        showJsonError(state, "{");
        return false;
      }
      state = jsonbegin;
    }

    if (c == '"')
    {
      switch (state)
      {
      case jsonbegin:
      case next:
        state = key;
        break;
      case colon:
        state = value;
        break;
      }
    }

    if (c == ':')
    {
      if (state != key)
      {
        showJsonError(state, ":");
        return false;
      }
      state = colon;
    }

    if (c == 't' || c == 'f' || c == '+' || c == '-' || (c >= '0' && c <= '9') || c == '.')
    {
      if (state != colon)
      {
        showJsonError(state, "v");
        return false;
      }
      state = value;
    }

    if (c == ',')
    {
      if (state != value)
      {
        showJsonError(state, ",");
        return false;
      }
      state = next;
    }

    if (c == '}')
    {
      if (state != value && state != jsonbegin)
      {
        showJsonError(state, "}");
        return false;
      }
      state = jsonend;
    }

    // if (state == key || state == value)
    //   Serial.print((char)c);
    // if (state == colon)
    // {
    //   Serial.print(': ');
    // }
    // if (state == jsonend || state == next)
    //   Serial.println();
    index++;
  }
  return true;
}

char buffer[256];
void loop()
{
  if (readJsonInput(buffer))
  {
    Serial.print(buffer);
    Serial.print(": ");
    if (parseJson(buffer))
    {
      Serial.println("Valid Json");
    }
    else
    {
      Serial.println("Invalid Json");
    }
  }
}
