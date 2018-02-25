// var Accessory = require('../').Accessory;
// var Service = require('../').Service;
// var Characteristic = require('../').Characteristic;
// var uuid = require('../').uuid;
// var sensorLib1 = require('node-dht-sensor');
// var sensorLib2 = require('node-dht-sensor');

// var sensorType = 22; // 11 for DHT11, 22 for DHT22 and AM2302
// var sensorPin1  = 17;  // The GPIO pin number for sensor signal
// var sensorPin2  = 4;  // The GPIO pin number for sensor signal
// if (!sensorLib1.initialize(sensorType, sensorPin1)) {
    // console.warn('Failed to initialize dht sensor 1');
    // process.exit(1);
// }
// if (!sensorLib2.initialize(sensorType, sensorPin2)) {
    // console.warn('Failed to initialize dht sensor 2');
    // process.exit(1);
// }

// // here's a temperature sensor device that we'll expose to HomeKit
// var DHT_SENSOR_1 = {
  // currentTemperature: 20,
  // currentHumidity: 30,
  // getTemperature: function() { 
    // console.log("Getting the current temperature!");
    // return DHT_SENSOR_1.currentTemperature;
  // },
  // getHumidity: function() { 
    // console.log("Getting the current humidity!");
    // return DHT_SENSOR_1.currentHumidity;
  // },
  // read() {
    // DHT_SENSOR_1.currentTemperature = sensorLib1.read().temperature.toFixed(1);
    // DHT_SENSOR_1.currentHumidity = sensorLib1.read().humidity.toFixed(1);
  // }
// }

// var DHT_SENSOR_2 = {
  // currentTemperature: 20,
  // currentHumidity: 30,
  // getTemperature: function() { 
    // console.log("Getting the current temperature!");
    // return DHT_SENSOR_2.currentTemperature;
  // },
  // getHumidity: function() { 
    // console.log("Getting the current humidity!");
    // return DHT_SENSOR_2.currentHumidity;
  // },
  // read() {
    // DHT_SENSOR_2.currentTemperature = sensorLib1.read().temperature.toFixed(1);
    // DHT_SENSOR_2.currentHumidity = sensorLib1.read().humidity.toFixed(1);
  // }
// }

// //In This example we create an Airconditioner Accessory that Has a Thermostat linked to a Fan Service.
// //For example, I've also put a Light Service that should be hidden to represent a light in the closet that is part of the AC. It is to show how to hide services.
// //The linking and Hiding does NOT appear to be reflected in Home

// // here's a fake hardware device that we'll expose to HomeKit
// var ACTest_data = {
  // fanPowerOn: false,
  // rSpeed: 100,

// }

// var CSS_Controller = {
  // name: 'Climate Control System', //name of accessory
  // UUID: uuid.generate('hap-nodejs:accessories:airconditioner'),
  // pincode: "031-45-154",
  // username: "1A:2B:3C:4D:5E:FF", // MAC like address used by HomeKit to differentiate accessories. 
  // manufacturer: "Aleksey Dalichuk", //manufacturer (optional)
  // model: "v1.0", //model (optional)
  // serialNumber: "A12S345KGB", //serial number (optional)
// }
// // This is the Accessory that we'll return to HAP-NodeJS that represents our fake fan.
// var ACTest = exports.accessory = new Accessory(CSS_Controller.name, CSS_Controller.UUID);

// // Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
// ACTest.username = CSS_Controller.username;
// ACTest.pincode = CSS_Controller.pincode;

// // set some basic properties (these values are arbitrary and setting them is optional)
// ACTest
  // .getService(Service.AccessoryInformation)
  // .setCharacteristic(Characteristic.Manufacturer, CSS_Controller.manufacturer)

// // listen for the "identify" event for this Accessory
// ACTest.on('identify', function(paired, callback) {
  // console.log("Climate Control System Identified!");
  // callback(); // success
// });

// // Add the actual Service and listen for change events from iOS.
// // We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`

// var FanService = ACTest.addService(Service.Fan, "Blower") // services exposed to the user should have "names" like "Fake Light" for us
// FanService.getCharacteristic(Characteristic.On)
  // .on('set', function(value, callback) {
    // console.log("Fan Power Changed To "+value);
    // ACTest_data.fanPowerOn=value
    // callback(); // Our fake Fan is synchronous - this value has been successfully set
  // });

// // We want to intercept requests for our current power state so we can query the hardware itself instead of
// // allowing HAP-NodeJS to return the cached Characteristic.value.
// FanService.getCharacteristic(Characteristic.On)
  // .on('get', function(callback) {

    // // this event is emitted when you ask Siri directly whether your fan is on or not. you might query
    // // the fan hardware itself to find this out, then call the callback. But if you take longer than a
    // // few seconds to respond, Siri will give up.

    // var err = null; // in case there were any problems

    // if (ACTest_data.fanPowerOn) {
      // callback(err, true);
    // }
    // else {
      // callback(err, false);
    // }
  // });


// // also add an "optional" Characteristic for spped
// FanService.addCharacteristic(Characteristic.RotationSpeed)
  // .on('get', function(callback) {
    // callback(null, ACTest_data.rSpeed);
  // })
  // .on('set', function(value, callback) {
    // console.log("Setting fan rSpeed to %s", value);
    // ACTest_data.rSpeed=value
    // callback();
  // })

// // This is the Accessory that we'll return to HAP-NodeJS.
// var T_IN_SERVICE = ACTest.addService(Service.TemperatureSensor, "T In")
// var H_IN_SERVICE = ACTest.addService(Service.HumiditySensor, "H In")

// var T_OUT_SERVICE = ACTest.addService(Service.TemperatureSensor, "T Out")
// var H_OUT_SERVICE = ACTest.addService(Service.HumiditySensor, "H Out")

// // Add the actual TemperatureSensor&HumiditySensor Service.
// // We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
// T_IN_SERVICE
  // .getCharacteristic(Characteristic.CurrentTemperature)
  // .on('get', function(callback) {
    
    // // return our current value
    // callback(null, DHT_SENSOR_1.getTemperature());
  // });

// H_IN_SERVICE
  // .getCharacteristic(Characteristic.CurrentRelativeHumidity )
  // .on('get', function(callback) {
    
    // // return our current value
    // callback(null, DHT_SENSOR_1.getHumidity());
  // });
  
// T_OUT_SERVICE
  // .getCharacteristic(Characteristic.CurrentTemperature)
  // .on('get', function(callback) {
    
    // // return our current value
    // callback(null, DHT_SENSOR_2.getTemperature());
  // });

// H_OUT_SERVICE
  // .getCharacteristic(Characteristic.CurrentRelativeHumidity )
  // .on('get', function(callback) {
    
    // // return our current value
    // callback(null, DHT_SENSOR_2.getHumidity());
  // });
  
// // temperature reading every 3 seconds
// setInterval(function() {
  
  // DHT_SENSOR_1.read();
  // DHT_SENSOR_2.read();
  
  // // update the characteristic value so interested iOS devices can get notified
  // T_IN_SERVICE.setCharacteristic(Characteristic.CurrentTemperature, DHT_SENSOR_1.currentTemperature);
  // H_IN_SERVICE.setCharacteristic(Characteristic.CurrentRelativeHumidity, DHT_SENSOR_1.currentHumidity);
  
  // T_OUT_SERVICE.setCharacteristic(Characteristic.CurrentTemperature, DHT_SENSOR_2.currentTemperature);
  // H_OUT_SERVICE.setCharacteristic(Characteristic.CurrentRelativeHumidity, DHT_SENSOR_2.currentHumidity);

// }, 3000);


// //LightService.setHiddenService(true);
// //ACTest.setPrimaryService(ThermostatService);
