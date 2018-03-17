var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var SerialPort = require('serialport');
var sleep = require('sleep');

// initialize UART and CO2 sensor
const buf = Buffer.from([0xff, 0x01, 0x99, 0x00, 0x00, 0x00, 0x07, 0xd0, 0x8f]);
var uart = new SerialPort('/dev/serial0', {baudRate: 9600});
sleep.sleep(2);
uart.write(buf);
sleep.msleep(100);
uart.read(9);

// here's a pressure sensor device that we'll expose to HomeKit
var CO2_SENSOR = {
  currentLevel: 400,
  getLevel: function() { 
    console.log("Getting the current CO2 level!");
    return CO2_SENSOR.currentLevel;
  },
  read() {
    const cmdBuf = Buffer.from([0xff,0x01,0x86,0x00,0x00,0x00,0x00,0x00,0x79]);
    uart.write(cmdBuf);
    sleep.msleep(200);
    var response=uart.read();
    
    if (response[0] == 0xff && response[1] == 0x86){
       currentLevel = response[2]*256 + response[3];
    }
  }
}

// This is the Accessory that we'll return to HAP-NodeJS.
var sensor = exports.accessory = new Accessory('CO2 Sensor', uuid.generate('hap-nodejs:accessories:co2sensor'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3E:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual Barometer Service.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
sensor
  .addService(Service.AirQualitySensor, "CO2")
  .getCharacteristic(Characteristic.CarbonDioxideLevel)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, CO2_SENSOR.getLevel());
  });
  
// temperature reading every 3 seconds
setInterval(function() {
  
  CO2_SENSOR.read();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.AirQualitySensor)
    .setCharacteristic(Characteristic.AirQuality, 1)
    .setCharacteristic(Characteristic.CarbonDioxideLevel, CO2_SENSOR.currentLevel);
  
}, 3000);
