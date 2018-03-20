var Service = require('../../').Service;
var Characteristic = require('../../').Characteristic;
var uuid = require('../../').uuid;
var Gpio = require('pigpio').Gpio;
var GPIOOnOff = require('onoff').Gpio;

class ThermostatController {
  constructor(options) {
    
    this.service = new Service.Thermostat(options.displayName, Service.Thermostat.UUID);
    
    this.CurrentHeatingCoolingState: 1,
    this.TargetHeatingCoolingState: 1,
    this.CurrentTemperature: 33,
    this.TargetTemperature: 32,
    this.TemperatureDisplayUnits: 1,
    this.LightOn: false
    this.powerOn = false;
    this.rotationSpeed = 100;
    this.powerOnRelay = new GPIOOnOff(26, 'out'),
    this.speed_1_Relay = new GPIOOnOff(19, 'out'),
    this.speed_2_Relay = new GPIOOnOff(13, 'out'),
    this.speed_3_Relay = new GPIOOnOff(6, 'out'),
     
    this.isLoggingEnabled = options.isLoggingEnabled;
    
    // Set service callbacks
    this.service.getCharacteristic(Characteristic.On)
    .on('set', function(value, callback) {
        this.setPowerOn(value);
        callback(); // Our fake Fan is synchronous - this value has been successfully set
    })
    .on('get', function(callback) {

        // this event is emitted when you ask Siri directly whether your fan is on or not. you might query
        // the fan hardware itself to find this out, then call the callback. But if you take longer than a
        // few seconds to respond, Siri will give up.

        var err = null; // in case there were any problems

        if (FAKE_FAN.powerOn) {
          callback(err, true);
        }
        else {
          callback(err, false);
        }
     });
     
    this.service.addCharacteristic(Characteristic.RotationSpeed)
    .on('get', function(callback) {
        callback(null, this.rotationSpeed);
    })
    .on('set', function(value, callback) {
        this.setSpeed(value);
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