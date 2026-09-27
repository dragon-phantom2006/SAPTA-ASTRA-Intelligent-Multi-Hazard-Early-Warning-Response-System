// Reference firmware skeleton: replace SENSOR_ID, DEVICE_KEY and Wi-Fi credentials.
// This sketch sends actual ADC/sensor readings; it never generates application dummy data.
#include <WiFi.h>
#include <HTTPClient.h>
const char* WIFI_SSID = "MSIT";
const char* WIFI_PASSWORD = "msit@1594";
const char* API_URL = "http://172.16.39.183:5000/api/v1/telemetry";
const char* SENSOR_ID = "TEST-SENSOR-02";
const char* DEVICE_KEY = "mKHNEYXRXBzkWw74yRioL_5-wbGhKBlRUTVqCQ9xJ30";
float readWaterLevelMeters(){
  // Replace with the calibrated hardware read. Example: float volts=analogRead(A0)*3.3/4095.0;
  // Return your sensor's real calibrated value.
  return 0.0f;
}
void setup(){ Serial.begin(115200); WiFi.begin(WIFI_SSID,WIFI_PASSWORD); while(WiFi.status()!=WL_CONNECTED) delay(500); }
void loop(){
  if(WiFi.status()==WL_CONNECTED){
    float water=readWaterLevelMeters();
    HTTPClient http; http.begin(API_URL); http.addHeader("Content-Type","application/json"); http.addHeader("X-Device-Key",DEVICE_KEY);
    String body=String("{\"sensor_id\":\"")+SENSOR_ID+"\",\"water_level_m\":"+String(water,3)+"}";
    int code=http.POST(body); Serial.printf("telemetry HTTP %d\n",code); http.end();
  }
  delay(5000);
}
