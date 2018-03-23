var Service = require('../../').Service;
var Characteristic = require('../../').Characteristic;
var uuid = require('../../').uuid;
var Gpio = require('pigpio').Gpio;
var GPIOOnOff = require('onoff').Gpio;

class ThermostatController {
  constructor(options) {
    
    this.service = new Service.Thermostat(options.displayName, Service.Thermostat.UUID);
    
    this.currentHeatingCoolingState = 1;
    this.targetHeatingCoolingState = 1;
    this.currentTemperature = 33;
    this.targetTemperature = 32;
    this.temperatureDisplayUnits = 1;
    
    this.isLoggingEnabled = options.isLoggingEnabled;
    
    // Set service callbacks
    this.service.getCharacteristic(Characteristic.currentHeatingCoolingState)
    .on('get', function(callback) {
        callback(null, cssData.currentHeatingCoolingState);
    }.bind(this))
    .on('set',function(value, callback) {
        cssData.currentHeatingCoolingState=value;
        console.log( "Characteristic currentHeatingCoolingState changed to %s",value);
        callback();
    }.bind(this));
     
    this.service.addCharacteristic(Characteristic.targetHeatingCoolingState)
    .on('get', function(callback) {
        callback(null, cssData.targetHeatingCoolingState);
    }.bind(this))
    .on('set',function(value, callback) {
        cssData.targetHeatingCoolingState=value;
        console.log( "Characteristic targetHeatingCoolingState changed to %s",value);
        callback();
    }.bind(this));
    
    this.service.getCharacteristic(Characteristic.currentTemperature)
    .on('get', function(callback) {
        callback(null, cssData.currentTemperature);
    }.bind(this))
    .on('set',function(value, callback) {
        cssData.currentTemperature=value;
        console.log( "Characteristic currentTemperature changed to %s",value);
        callback();
    }.bind(this));

    this.service.getCharacteristic(Characteristic.targetTemperature)
    .on('get', function(callback) {
        callback(null, cssData.targetTemperature);
    }.bind(this))
    .on('set',function(value, callback) {
        cssData.targetTemperature=value;
        console.log( "Characteristic targetTemperature changed to %s",value);
        callback();
    }.bind(this));

    this.service.getCharacteristic(Characteristic.temperatureDisplayUnits)
    .on('get', function(callback) {
        callback(null, cssData.temperatureDisplayUnits);
    }.bind(this))
    .on('set',function(value, callback) {
        cssData.temperatureDisplayUnits=value;
        console.log( "Characteristic temperatureDisplayUnits changed to %s",value);
        callback();
    }.bind(this));
  }
  
  getService() {
    return this.service;  
  }
}

module.exports = ThermostatController;