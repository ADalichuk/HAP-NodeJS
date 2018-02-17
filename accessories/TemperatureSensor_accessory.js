var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var sensorLib = require('node-dht-sensor');

var sensorType = 22; // 11 for DHT11, 22 for DHT22 and AM2302
var sensorPin  = 17;  // The GPIO pin number for sensor signal
if (!sensorLib.initialize(sensorType, sensorPin)) {
    console.warn('Failed to initialize sensor');
    process.exit(1);
}

// here's a temperature sensor device that we'll expose to HomeKit
var DHT_SENSOR = {
  currentTemperature: 20,
  currentHumidity: 30,
  getTemperature: function() { 
    console.log("Getting the current temperature!");
    return DHT_SENSOR.currentTemperature;
  },
  getHumidity: function() { 
    console.log("Getting the current humidity!");
    return DHT_SENSOR.currentHumidity;
  },
  read() {
    DHT_SENSOR.currentTemperature = sensorLib.read().temperature.toFixed(1));
    DHT_SENSOR.currentHumidity = sensorLib.read().humidity.toFixed(1));
  }
}

// Generate a consistent UUID for our Temperature&Humidity Sensor Accessory that will remain the same
// even when restarting our server. We use the `uuid.generate` helper function to create
// a deterministic UUID based on an arbitrary "namespace" and the string "temperature-sensor", "humidity-sensor".

// This is the Accessory that we'll return to HAP-NodeJS.
var temperatureSensor = exports.accessory = new Accessory('Temperature Sensor', uuid.generate('hap-nodejs:accessories:temperature-sensor'));
var humiditySensor = exports.accessory = new Accessory('Humidity Sensor', uuid.generate('hap-nodejs:accessories:humidity-sensor'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
temperatureSensor.username = "C1:5D:3A:AE:5E:FA";
temperatureSensor.pincode = "031-45-154";
humiditySensor.username = "C1:5D:3A:AE:5E:FA";
humiditySensor.pincode = "031-45-154";

// Add the actual TemperatureSensor&HumiditySensor Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
temperatureSensor
  .addService(Service.TemperatureSensor)
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, DHT_SENSOR.getTemperature());
  });

humiditySensor
  .addService(Service.HumiditySensor)
  .getCharacteristic(Characteristic.CurrentHumidity)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, DHT_SENSOR.getHumidity());
  });
  
// temperature reading every 3 seconds
setInterval(function() {
  
  DHT_SENSOR.read();
  
  // update the characteristic value so interested iOS devices can get notified
  temperatureSensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, DHT_SENSOR.currentTemperature);
    
  humiditySensor
    .getService(Service.HumiditySensor)
    .setCharacteristic(Characteristic.CurrentHumidity, DHT_SENSOR.currentHumidity);
  
}, 3000);
