var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var BMP085 = require('bmp085');

var barometer = new BMP085(
      {
        'mode': 1,
        'address': 0x77,
        'device': '/dev/i2c-1'
    }
);

// here's a pressure sensor device that we'll expose to HomeKit
var BMP_SENSOR = {
  currentPressure: 760,
  getPressure: function() { 
    console.log("Getting the current pressure!");
    return BMP_SENSOR.currentPressure;
  },
  read() {
    barometer.read(function (data) {
            console.log("Pressure:", (data.pressure).toFixed(2));
            //BMP_SENSOR.currentPressure = data.pressure.toFixed(2)*0.00750062;
      });
  }
}

// This is the Accessory that we'll return to HAP-NodeJS.
var sensor = exports.accessory = new Accessory('BMP Sensor', uuid.generate('hap-nodejs:accessories:temperature-sensor'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual Barometer Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.TemperatureSensor, "Barometer")
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, BMP_SENSOR.getPressure());
  });
  
// temperature reading every 3 seconds
setInterval(function() {
  
  BMP_SENSOR.read();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, BMP_SENSOR.currentPressure);
  
}, 3000);
