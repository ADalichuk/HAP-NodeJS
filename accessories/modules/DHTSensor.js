var Service = require('../../').Service;
var Characteristic = require('../../').Characteristic;
var uuid = require('../../').uuid;
var sensorLib = require('node-dht-sensor');

class DHTSensor {
  constructor(temperatureSensorName, humiditySensorName, pinNumber, isLoggingEnabled) {
      
    this.serviceTemperature = new Service.TemperatureSensor(
    temperatureSensorName,
    uuid.generate(temperatureSensorName));
    
    this.serviceHumidity = new Service.HumiditySensor(
    humiditySensorName,
    uuid.generate(humiditySensorName));

    this.currentTemperature = 20;
    this.currentHumidity = 30;
    this.temperatureSensorName = temperatureSensorName;
    this.humiditySensorName = humiditySensorName;
    this.sensorType = 22; // DHT22
    this.gpioPin = pinNumber
    this.isLoggingEnabled = isLoggingEnabled;
    
    // Service callbacks
    this.serviceTemperature.getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', function(callback) {
        this.getData().temperature;
    }.bind(this));
    
    this.serviceHumidity.getCharacteristic(Characteristic.CurrentRelativeHumidity)
    .on('get', function(callback) {
        this.getData().humidity;
    }.bind(this));
  }
  
  getTemperatureService() {
    return this.serviceTemperature;  
  }
  
  getHumidityService() {
    return this.serviceHumidity;  
  }
  
  getData() {
    return {temperature: this.currentTemperature, humidity: this.currentHumidity};
  }
  
  read() {
    var data = sensorLib.read(this.sensorType, this.gpioPin);
    if (this.isLoggingEnabled)
        console.log("Reading DHT sensor on pin %d; T = %dC, H = %d% ",this.gpioPin, this.currentTemperature, this.currentHumidity);
    this.currentTemperature = data.temperature.toFixed(1);
    this.currentHumidity = data.humidity.toFixed(1);
    this.serviceTemperature.setCharacteristic(Characteristic.CurrentTemperature, this.currentTemperature);
    this.serviceHumidity.setCharacteristic(Characteristic.CurrentRelativeHumidity, this.currentHumidity);
  }
}

module.exports = DHTSensor;
