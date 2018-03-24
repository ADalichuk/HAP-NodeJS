var Service = require('../../').Service;
var Characteristic = require('../../').Characteristic;
var uuid = require('../../').uuid;
var Gpio = require('pigpio').Gpio;
var GPIOOnOff = require('onoff').Gpio;

class FanController {
  constructor(isLoggingEnabled) {

    this.powerOn = false;
    this.rotationSpeed = 100;
    this.powerOnRelay = new GPIOOnOff(26, 'out'),
    this.speed_1_Relay = new GPIOOnOff(19, 'out'),
    this.speed_2_Relay = new GPIOOnOff(13, 'out'),
    this.speed_3_Relay = new GPIOOnOff(6, 'out'),
     
    this.isLoggingEnabled = isLoggingEnabled;
  }
  
  setOnOffStatus(isPowerOn, callback) {
    this.powerOn = isPowerOn;
    this.powerOnRelay.writeSync(this.powerOn ? 0 : 1);
    if(callback)
        callback();
  }
  
  getOnOffStatus(callback) {
    if (callback == null)
        return this.powerOn;
    var err = null; // in case there were any problems
    if (this.powerOn)
      callback(err, true);
    else
      callback(err, false);
    
  }
  
  setSpeed(value, callback) {
    if (this.isLoggingEnabled)
        console.log("Setting fan rotationSpeed to %s", value);
    this.rotationSpeed = value;
    if(callback)
        callback();
  }
  
  getSpeed(callback) {
    if (callback == null)
        return this.rotationSpeed;
    callback(null, this.rotationSpeed)

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

module.exports = FanController;
