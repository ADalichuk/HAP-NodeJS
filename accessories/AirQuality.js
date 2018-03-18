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
  currentLevel: 399,
  getLevel: function() { 
    console.log("Getting the current CO2 level. CO2=" + this.currentLevel + " ppm");
    return this.currentLevel;
  },
  read() {
    const cmdBuf = Buffer.from([0xff,0x01,0x86,0x00,0x00,0x00,0x00,0x00,0x79]);
    uart.write(cmdBuf);
    sleep.msleep(200);
    var response=uart.read();
    
    if (response[0] == 0xff && response[1] == 0x86){
       this.currentLevel = response[2]*256 + response[3];
       //console.log("Current CO2 level = " + currentLevel);
    }
  }
}

// This is the Accessory that we'll return to HAP-NodeJS.
var sensor = exports.accessory = new Accessory('CO2 Sensor', uuid.generate('hap-nodejs:accessories:co2sensor'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
sensor.username = "C1:5D:3E:AE:5E:FA";
sensor.pincode = "031-45-154";

// Add the actual Air Quality Service.
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
  
  var airQuality = Characteristic.AirQuality.UNKNOWN;
  var CO2Level = CO2_SENSOR.getLevel();
  switch (true) {
    case (CO2Level < 500):
        airQuality = Characteristic.AirQuality.EXCELLENT;
        break;
    case (CO2Level > 500 && CO2Level < 800):
        airQuality = Characteristic.AirQuality.GOOD;
        break;
    case (CO2Level > 800 && CO2Level < 1100):
        airQuality = Characteristic.AirQuality.FAIR;
        break;
    case (CO2Level > 1100 && CO2Level < 1500):
        airQuality = Characteristic.AirQuality.INFERIOR;
        break;
    case (CO2Level > 1500):
        airQuality = Characteristic.AirQuality.POOR;
        break;
  }

  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.AirQualitySensor)
    .setCharacteristic(Characteristic.AirQuality, airQuality)
    .setCharacteristic(Characteristic.CarbonDioxideLevel, CO2_SENSOR.getLevel());
}, 3000);
