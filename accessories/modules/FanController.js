var Service = require('../../').Service;
var Characteristic = require('../../').Characteristic;
var uuid = require('../../').uuid;
var Gpio = require('pigpio').Gpio;
var GPIOOnOff = require('onoff').Gpio;

module.exports = FanController;

class FanController {
  constructor(options) {
    
    this.service = new Service(options.displayName);
    
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
















// here's a fake hardware device that we'll expose to HomeKit
var this = {
  powerOn: false,
  rotationSpeed: 100,
  pwmControl: new Gpio(12, {mode: Gpio.OUTPUT}),
  powerOnRelay: new GPIOOnOff(26, 'out'),
  speed_1_Relay: new GPIOOnOff(19, 'out'),
  speed_2_Relay: new GPIOOnOff(13, 'out'),
  speed_3_Relay: new GPIOOnOff(6, 'out'),
  setPowerOn: function(on) {
    if(on){
      //put your code here to turn on the fan
      this.powerOn = on;
    }
    else{
      //put your code here to turn off the fan
      this.powerOn = on;
    }
  },
  setSpeed: function(value) {
    console.log("Setting fan rotationSpeed to %s", value);
    this.rotationSpeed = value;
    //put your code here to set the fan to a specific value
  },
  identify: function() {
    //put your code here to identify the fan
    console.log("Fan Identified!");
  }
}

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake fan.
var fan = exports.accessory = new Accessory('Fan', uuid.generate('hap-nodejs:accessories:Fan'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
fan.username = "1A:2B:3C:4D:5E:FF";
fan.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
fan
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Sample Company")

// listen for the "identify" event for this Accessory
fan.on('identify', function(paired, callback) {
  this.identify();
  callback(); // success
});

// Add the actual Fan Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
fan
  .addService(Service.Fan, "Fan") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    this.setPowerOn(value);
    callback(); // Our fake Fan is synchronous - this value has been successfully set
  });

// We want to intercept requests for our current power state so we can query the hardware itself instead of
// allowing HAP-NodeJS to return the cached Characteristic.value.
fan
  .getService(Service.Fan)
  .getCharacteristic(Characteristic.On)
  .on('get', function(callback) {

    // this event is emitted when you ask Siri directly whether your fan is on or not. you might query
    // the fan hardware itself to find this out, then call the callback. But if you take longer than a
    // few seconds to respond, Siri will give up.

    var err = null; // in case there were any problems

    if (this.powerOn) {
      callback(err, true);
    }
    else {
      callback(err, false);
    }
  });

// also add an "optional" Characteristic for spped
fan
  .getService(Service.Fan)
  .addCharacteristic(Characteristic.RotationSpeed)
  .on('get', function(callback) {
    callback(null, this.rotationSpeed);
  })
  .on('set', function(value, callback) {
    this.setSpeed(value);
    callback();
  })

// Setup fans speed control 
setInterval(function () {
  //this.pwmControl.pwmWrite(Math.floor(this.rotationSpeed * 255 / 100) * !this.powerOn);
  this.pwmControl.pwmWrite(255 * !this.powerOn);
  this.powerOnRelay.writeSync(this.powerOn ? 0 : 1);
  
  // turn on corresponding relay according to fan speed value
   switch (true) {        
     case (this.rotationSpeed < 33):
         this.speed_3_Relay.writeSync(1);
         this.speed_2_Relay.writeSync(1);
         this.speed_1_Relay.writeSync(0);
         break;
     case (this.rotationSpeed >= 33 && this.rotationSpeed < 66 ):
         this.speed_3_Relay.writeSync(1);
         this.speed_1_Relay.writeSync(1);
         this.speed_2_Relay.writeSync(0);
         break;
     case (this.rotationSpeed >= 66):
         this.speed_2_Relay.writeSync(1);
         this.speed_1_Relay.writeSync(1);
         this.speed_3_Relay.writeSync(0);
         break;
   }
}, 500);// update fan speed once per 500 milliseconds
