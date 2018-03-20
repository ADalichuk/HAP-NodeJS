var Service = require('../../').Service;
var Characteristic = require('../../').Characteristic;
var uuid = require('../../').uuid;
var Gpio = require('pigpio').Gpio;
var GPIOOnOff = require('onoff').Gpio;

class ThermostatController {
  constructor(options) {
    
    this.service = new Service.Thermostat(options.displayName, Service.Thermostat.UUID);
    
    this.currentHeatingCoolingState: 1,
    this.targetHeatingCoolingState: 1,
    this.currentTemperature: 33,
    this.targetTemperature: 32,
    this.temperatureDisplayUnits: 1,
    
    this.isLoggingEnabled = options.isLoggingEnabled;
    
    // Set service callbacks
    this.service.getCharacteristic(Characteristic.currentHeatingCoolingState)
    .on('get', function(callback) {
        callback(null, cssData.currentHeatingCoolingState);
    })
    .on('set',function(value, callback) {
        cssData.currentHeatingCoolingState=value;
        console.log( "Characteristic currentHeatingCoolingState changed to %s",value);
        callback();
    });
     
    this.service.addCharacteristic(Characteristic.targetHeatingCoolingState)
    .on('get', function(callback) {
        callback(null, cssData.targetHeatingCoolingState);
    })
    .on('set',function(value, callback) {
        cssData.targetHeatingCoolingState=value;
        console.log( "Characteristic targetHeatingCoolingState changed to %s",value);
        callback();
    });
    
    this.service.getCharacteristic(Characteristic.currentTemperature)
    .on('get', function(callback) {
        callback(null, cssData.currentTemperature);
    })
    .on('set',function(value, callback) {
        cssData.currentTemperature=value;
        console.log( "Characteristic currentTemperature changed to %s",value);
        callback();
    });

    this.service.getCharacteristic(Characteristic.targetTemperature)
    .on('get', function(callback) {
        callback(null, cssData.targetTemperature);
    })
    .on('set',function(value, callback) {
        cssData.targetTemperature=value;
        console.log( "Characteristic targetTemperature changed to %s",value);
        callback();
    });

    this.service.getCharacteristic(Characteristic.temperatureDisplayUnits)
    .on('get', function(callback) {
        callback(null, cssData.temperatureDisplayUnits);
    })
    .on('set',function(value, callback) {
        cssData.temperatureDisplayUnits=value;
        console.log( "Characteristic temperatureDisplayUnits changed to %s",value);
        callback();
    });
  }
  
  getService() {
    return this.service;  
  }
  
  setPowerOn(isPowerOn) {
      this.powerOn = isPowerOn;
      this.powerOnRelay.writeSync(this.powerOn ? 0 : 1);
  }
  
  setSpeed(value) {
      if (isLoggingEnabled)
          console.log("Setting fan rotationSpeed to %s", value);
      this.rotationSpeed = value;
  }
  
  updateSpeed() {
      // turn on corresponding relay according to fan speed value
      switch (true) {        
        case (this.rSpeed < 33):
            this.speed_3_Relay.writeSync(1);
            this.speed_2_Relay.writeSync(1);
            this.speed_1_Relay.writeSync(0);
            break;
        case (this.rSpeed >= 33 && this.rSpeed < 66 ):
            this.speed_3_Relay.writeSync(1);
            this.speed_1_Relay.writeSync(1);
            this.speed_2_Relay.writeSync(0);
            break;
        case (this.rSpeed >= 66):
            this.speed_2_Relay.writeSync(1);
            this.speed_1_Relay.writeSync(1);
            this.speed_3_Relay.writeSync(0);
            break;
      }      
  }
  
  identify() {
    console.log("Fan Identified!");
  }
}

module.exports = ThermostatController;