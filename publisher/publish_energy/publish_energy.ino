/*
 * http://www.instructables.com/id/How-to-Use-MQTT-With-the-Raspberry-Pi-and-ESP8266/#CNLP6YQJFUAGAUB
 */
#include <ESP8266WiFi.h> // Habilita que o ESP8266 se conecte ao WiFi
#include <PubSubClient.h> // Biblioteca que habilita a publicação da mensagem no Broker
#include "EmonLib.h"

EnergyMonitor SCT013;
int pinSCT = A0;  //Pino analógico conectado ao SCT-013
int tensao = 127;

// WiFi
const char* ssid = "Oi_Velox_WiFi_0C60";//O SSID da sua rede
const char* wifi_password = "pedronat"; //sua senha

// MQTT
const char* mqtt_server = "192.168.0.11"; //Endereço de IP do Broker
const char* mqtt_topic = "energia";
const char* mqtt_username = "pi";
const char* mqtt_password = "raspberry";
const char* clientID = "04061995";

long randNumber;

// Inicializa o WiFi e o publisher
WiFiClient wifiClient;
PubSubClient client(mqtt_server, 3001, wifiClient); // 3001 é a porta que será liberada para a comunicação

void setup() {
  Serial.begin(115200);

  Serial.print("Connecting to ");
  Serial.println(ssid);

  // Calibra a leitura da corrente
  SCT013.current(pinSCT, 6.0606);

  // Conecta no WiFi
  WiFi.begin(ssid, wifi_password);

  // Wait until the connection has been confirmed before continuing
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Connect to MQTT Broker
  // client.connect retorna um boleano indicando o resultado da conexão.
  // Se a conexão falhou, certifique-se que o SSID e o Password estao corretos
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
    const char* pot = SerialData.c_str();
    
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
    delay(1000);
}
