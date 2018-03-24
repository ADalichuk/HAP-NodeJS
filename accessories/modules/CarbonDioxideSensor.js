var Characteristic = require('../../').Characteristic;
var Service = require('../../').Service;
var SerialPort = require('serialport');
var sleep = require('sleep');

class CarbonDioxideSensor {
  constructor(isLoggingEnabled) {
      
    this.setRangeCmd = Buffer.from([0xff, 0x01, 0x99, 0x00, 0x00, 0x00, 0x07, 0xd0, 0x8f]);
    this.readDataCmd = Buffer.from([0xff, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
    this.uart = null;
    
    this.currentLevel = 399;
    this.airQuality = Characteristic.AirQuality.UNKNOWN;
    
    this.isLoggingEnabled = isLoggingEnabled;
    
    this.uart = new SerialPort('/dev/serial0', {baudRate: 9600});
    sleep.sleep(2);
    this.uart.write(this.setRangeCmd);
    sleep.msleep(100);
    this.uart.read(9);
  }
  
  read() {
    this.uart.write(this.readDataCmd);
    sleep.msleep(200);
    var response = this.uart.read();
    
    if (response && response[0] == 0xff && response[1] == 0x86){
        this.currentLevel = response[2]*256 + response[3];
        if (this.isLoggingEnabled)
            console.log("Reading the current CO2 level. CO2 = " + this.currentLevel + " ppm");
    }
  }
  
  getLevel(callback) {
    if (this.isLoggingEnabled)
        console.log("Getting the current CO2 level. CO2 = " + this.currentLevel + " ppm");
    if (callback)
        callback(null, this.currentLevel);
    return this.currentLevel;
  }
  
  getAirQuality(callback) {
      switch (true) {
        case (this.currentLevel < 500):
            this.airQuality = Characteristic.AirQuality.EXCELLENT;
            break;
        case (this.currentLevel > 500 && this.currentLevel < 800):
            this.airQuality = Characteristic.AirQuality.GOOD;
            break;
        case (this.currentLevel > 800 && this.currentLevel < 1100):
            this.airQuality = Characteristic.AirQuality.FAIR;
            break;
        case (this.currentLevel > 1100 && this.currentLevel < 1500):
            this.airQuality = Characteristic.AirQuality.INFERIOR;
            break;
        case (this.currentLeve > 1500):
            this.airQuality = Characteristic.AirQuality.POOR;
            break;
      }
      if (this.isLoggingEnabled)
        console.log("Getting the current Air Quality. Air Quality = " + this.AirQuality);
      if (callback)
        callback(null, this.AirQuality);
      return this.AirQuality;
  }
}

module.exports = CarbonDioxideSensor;