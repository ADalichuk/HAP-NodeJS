var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var BMP085 = require('bmp085');

var barometer = new BMP085(
      {
        'mode': 3,
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
    var sensorObjRef = this;
     
    barometer.read(function (data) {
            console.log("Pressure:", (data.pressure*0.0750062).toFixed(2));
            sensorObjRef.currentPressure = (data.pressure*0.0750062).toFixed(2);
      });
    console.log("that:", BMP_SENSOR.currentPressure);
  }
}

// This is the Accessory that we'll return to HAP-NodeJS.
var sensor = exports.accessory = new Accessory('BMP Sensor', '0000008D-0000-1000-8000-0026BB765291');

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3A:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual Barometer Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.AirQualitySensor, "Barometer")
  .getCharacteristic(Characteristic.PM10Density)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, BMP_SENSOR.getPressure());
  });
  
// temperature reading every 3 seconds
setInterval(function() {
  
  BMP_SENSOR.read();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.AirQualitySensor)
    .setCharacteristic(Characteristic.PM10Density, BMP_SENSOR.currentPressure);
  
}, 3000);
