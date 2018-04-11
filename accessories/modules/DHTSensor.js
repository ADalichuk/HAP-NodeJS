var Service = require('../../').Service;
var Characteristic = require('../../').Characteristic;
var uuid = require('../../').uuid;

class DHTSensorController {
  constructor(sensorLib, pinNumber, isLoggingEnabled) {

    this.temperature = 20;
    this.humidity = 30;
    this.sensorType = 22; // DHT22
    this.sensorLib = sensorLib;
    this.gpioPin = pinNumber
    this.isLoggingEnabled = isLoggingEnabled;
  }
  
  getTemperature(callback) {
    if (callback == null)
        return this.temperature;
    var err = null; // in case there were any problems
    callback(err, this.temperature);
  }
  
  getHumidity(callback) {
    if (callback == null)
        return this.humidity;
    var err = null; // in case there were any problems
    callback(err, this.humidity);
  }  
  
  getData() {
    return {temperature: this.temperature, humidity: this.humidity};
  }
  
  read() {
    var data = this.sensorLib.read(this.sensorType, this.gpioPin);
    if (this.isLoggingEnabled)
        console.log("Reading DHT sensor on pin %d; T = %dC, H = %d% ",this.gpioPin, this.temperature, this.humidity);
    this.temperature = data.temperature.toFixed(1);
    this.humidity = data.humidity.toFixed(1);
    this.serviceTemperature.setCharacteristic(Characteristic.CurrentTemperature, this.temperature);
    this.serviceHumidity.setCharacteristic(Characteristic.CurrentRelativeHumidity, this.humidity);
  }
}

module.exports = DHTSensorController;