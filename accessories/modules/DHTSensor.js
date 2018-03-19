var Service = require('../../').Service;
var Characteristic = require('../../').Characteristic;
var uuid = require('../../').uuid;
var sensorLib = require('node-dht-sensor');

class DHTSensor {
  constructor(options) {
      
    this.serviceTemperature = new Service(
    options.temperatureSensorName,
    uuid.generate(options.temperatureSensorName + options.humiditySensorName));
    
    this.serviceHumidity = new Service(
    options.humiditySensorName,
    uuid.generate(options.temperatureSensorName + options.humiditySensorName));

    this.currentTemperature = 20;
    this.currentHumidity = 30;
    this.temperatureSensorName = options.temperatureSensorName;
    this.humiditySensorName = options.humiditySensorName;
    this.sensorType = 22; // DHT22
    this.gpioPin = options.pinNumber
    this.isLoggingEnabled = options.isLoggingEnabled;
    
    // Service callbacks
    this.serviceTemperature.getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', function(callback) {
        this.getData().temperature;
    });
    
    this.serviceHumidity.getCharacteristic(Characteristic.CurrentHumidity)
    .on('get', function(callback) {
        this.getData().humidity;
    });
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
        console.log("Reading DHT sensor on pin {0}; T = {1}C, H = {2}% ".format(this.gpioPin, this.currentTemperature, this.currentHumidity));
    this.currentTemperature = data.temperature.toFixed(1);
    this.currentHumidity = data.humidity.toFixed(1);
    this.serviceTemperature.setCharacteristic(Characteristic.CurrentTemperature, this.currentTemperature);
    this.serviceHumidity.setCharacteristic(Characteristic.CurrentRelativeHumidity, this.currentHumidity);
  }
}

module.exports = DHTSensor;