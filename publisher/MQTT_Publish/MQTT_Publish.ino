/*
 * ESP8266 (Adafruit HUZZAH) Mosquitto MQTT Publish Example
 * Thomas Varnish (https://github.com/tvarnish), (https://www.instructables.com/member/Tango172)
 * Made as part of my MQTT Instructable - "How to use MQTT with the Raspberry Pi and ESP8266"
 */
#include <ESP8266WiFi.h> // Enables the ESP8266 to connect to the local network (via WiFi)
#include <PubSubClient.h> // Allows us to connect to, and publish to the MQTT broker
#include "EmonLib.h"

// Esp8266
EnergyMonitor SCT013;
int pinSCT = A0;   //Pino analógico conectado ao SCT-013
int tensao = 127;
//int potencia;

// WiFi
// Make sure to update this for your own WiFi network!
const char* ssid = "Oi_Velox_WiFi_0C60";//"Your SSID";
const char* wifi_password = "pedronat";

// MQTT
// Make sure to update this for your own MQTT Broker!
const char* mqtt_server = "192.168.0.9";//"MQTT Broker IP Address";
//const char* mqtt_server = "192.168.56.1";//"MQTT Broker IP Address";
const char* mqtt_topic = "energia";
//const char* mqtt_username = "pi";
//const char* mqtt_password = "raspberry";
const char* mqtt_username = "PEDRO";
const char* mqtt_password = "";
// The client id identifies the ESP8266 device. Think of it a bit like a hostname (Or just a name, like Greg).
const char* clientID = "04061995";

long randNumber;

// Initialise the WiFi and MQTT Client objects
WiFiClient wifiClient;
PubSubClient client(mqtt_server, 3000, wifiClient); // 1883 is the listener port for the Broker

void setup() {
  Serial.begin(115200);

  Serial.print("Connecting to ");
  Serial.println(ssid);

  // esp8266
  SCT013.current(pinSCT, 6.0606);

  // Connect to the WiFi
  WiFi.begin(ssid, wifi_password);

  // Wait until the connection has been confirmed before continuing
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // Debugging - Output the IP Address of the ESP8266
  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Connect to MQTT Broker
  // client.connect returns a boolean value to let us know if the connection was successful.
  // If the connection is failing, make sure you are using the correct MQTT Username and Password (Setup Earlier in the Instructable)
  if (client.connect(clientID, mqtt_username, mqtt_password)) {
    Serial.println("Connected to MQTT Broker!");
  }
  else {
    Serial.println("Connection to MQTT Broker failed...");
  }
  
}

void loop() {
    int potencia;
    double Irms = SCT013.calcIrms(1480);   // Calcula o valor da Corrente
    potencia = Irms * tensao;          // Calcula o valor da Potencia Instantanea    

    Serial.print("Potencia = ");
    Serial.print(potencia);
    Serial.println(" W");

    Serial.println("...");
    
    String SerialData="";
    SerialData = String(potencia);
    Serial.print("String: ");
    Serial.println(SerialData);
    Serial.println("...");
    const char* pot = SerialData.c_str();
    Serial.print("Char: ");
    Serial.println(pot);
    Serial.println("...");
    //const char* pot[8];//String(getPotencia());
    //sprintf(pot, "%d", potencia);
    
    // PUBLISH to the MQTT Broker (topic = mqtt_topic, defined at the beginning)
    // Here, "Button pressed!" is the Payload, but this could be changed to a sensor reading, for example.
    if (client.publish(mqtt_topic, pot)) {
      Serial.println("Valor da potencia enviado pro broken");
    }
    // Again, client.publish will return a boolean value depending on whether it succeded or not.
    // If the message failed to send, we will try again, as the connection may have broken.
    else {
      Serial.println("Message failed to send. Reconnecting to MQTT Broker and trying again");
      client.connect(clientID, mqtt_username, mqtt_password);
      delay(10); // This delay ensures that client.publish doesn't clash with the client.connect call
      client.publish(mqtt_topic, pot);
    }
    delay(5000);
}

