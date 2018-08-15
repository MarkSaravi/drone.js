#include <stdio.h>
#include <stdlib.h>
#include <string.h>
typedef enum JsonErrors {NoError, MissingStart, MissingEnd, MissingComma, LengthError, KeyError, MissingDoubleQouteError, MissingColon, MissingValueError} JsonErrors;

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
    while ((json[endIndex] >= '0' && json[endIndex]<='9') || json[endIndex] == '.') endIndex++;
    if (endIndex == startIndex || (endIndex - startIndex) > 20) return MissingValueError;
    memcpy(buffer, json + startIndex, endIndex - startIndex);
    buffer[endIndex - startIndex] = (char)NULL;
    *value = atof (buffer);
    *sIndex = endIndex;
    return NoError;
}

JsonErrors readJson(const char *json, double *a, double *b, double *c, double *d)
{
    int index = 1;
    double value;
    double values[4];
    const char sep[] = {',', ',',',', '}'};
    const char keys[] = {'a', 'b', 'c', 'd'};
    
    int len = strlen(json);
    if (len < 26) return LengthError;
    if (json[0] != '{') return MissingStart;
    if (json[len -1] == '\n') len--;
    if (json[len -1] != '}') return MissingEnd;
    JsonErrors err = NoError;

    for (int i=0; i<4; i++)
    {
        err = readJsonKeyValue(json, &index, keys[i], &value);
        if (err != NoError) return err;
        if (json[index] != sep[i]) return MissingComma;
        index++;
        values[i] = value;
    }
    *a = values[0];
    *b = values[1];
    *c = values[2];
    *d = values[3];
    return err;
}

int main() 
{
    double a,b,c,d;
    char *json = "{\"a\":12.305,\"b\":13.567,\"c\":14.568,\"d\":14.569}";
    JsonErrors err = readJson(json, &a, &b, &c, &d);
    printf("%d %f %f %f %f\n", err,a, b, c, d);
    
}
