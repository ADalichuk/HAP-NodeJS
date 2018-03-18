var Characteristic = require('../../').Characteristic;
var Service = require('../../').Service;
var SerialPort = require('serialport');
var sleep = require('sleep');


class CarbonDioxideSensor {
  constructor(options) {
      
    this.service = Service(Service.AirQualitySensor, "CO2");

    this.setRangeCmd = Buffer.from([0xff, 0x01, 0x99, 0x00, 0x00, 0x00, 0x07, 0xd0, 0x8f]);
    this.readDataCmd = Buffer.from([0xff, 0x01, 0x86, 0x00, 0x00, 0x00, 0x00, 0x00, 0x79]);
    this.uart = null;
    
    this.currentLevel = 399;
    this.airQuality = Characteristic.AirQuality.UNKNOWN;
    
    this.isLoggingEnabled = options.isLoggingEnabled;
  }

  initialize() {
    this.uart = new SerialPort('/dev/serial0', {baudRate: 9600});
    sleep.sleep(2);
    uart.write(this.setRangeCmd);
    sleep.msleep(100);
    this.uart.read(9);
    
    this.service.getCharacteristic(Characteristic.CarbonDioxideLevel)
    .on('get', function(callback) {
        this.getLevel();
    });
  }
  
  getService() {
    return this.service;  
  }
  
  getLevel() {
    if (this.isLoggingEnabled)
        console.log("Getting the current CO2 level. CO2 = " + this.currentLevel + " ppm");
    return this.currentLevel;
  }
  
  read() {
    this.uart.write(this.readDataCmd);
    sleep.msleep(200);
    var response=this.uart.read();
    
    if (response[0] == 0xff && response[1] == 0x86){
        this.currentLevel = response[2]*256 + response[3];
        this.service
            .setCharacteristic(Characteristic.AirQuality, this.getAirQuality())
            .setCharacteristic(Characteristic.CarbonDioxideLevel, this.getLevel());
        if (this.isLoggingEnabled)
            console.log("Reading the current CO2 level. CO2 = " + this.currentLevel + " ppm");
    }
  }
  
  getAirQuality() {
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
  }
  
  
}

module.exports = CarbonDioxideSensor;
