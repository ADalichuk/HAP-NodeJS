var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;

// here's a fake hardware device that we'll expose to HomeKit
var cssData = {
  fanPowerOn: false,
  rSpeed: 100,
  CurrentHeatingCoolingState: 1,
  TargetHeatingCoolingState: 1,
  CurrentTemperature: 33,
  TargetTemperature: 32,
  TemperatureDisplayUnits: 1,
  LightOn: false
}

// This is the Accessory that we'll return to HAP-NodeJS that represents our fake fan.
var cssAccessory = exports.accessory = new Accessory('Air Conditioner', uuid.generate('hap-nodejs:accessories:airconditioner'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
cssAccessory.username = "1A:2B:3C:4D:5E:FF";
cssAccessory.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
cssAccessory
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "Sample Company")

// listen for the "identify" event for this Accessory
cssAccessory.on('identify', function(paired, callback) {
  console.log("Fan Identified!");
  callback(); // success
});

var ThermostatService = cssAccessory.addService(Service.Thermostat,"Thermostat");

ThermostatService.getCharacteristic(Characteristic.CurrentHeatingCoolingState)

  .on('get', function(callback) {
    callback(null, cssData.CurrentHeatingCoolingState);
  })
  .on('set',function(value, callback) {
      cssData.CurrentHeatingCoolingState=value;
      console.log( "Characteristic CurrentHeatingCoolingState changed to %s",value);
      callback();
    });

 ThermostatService.getCharacteristic(Characteristic.TargetHeatingCoolingState)
  .on('get', function(callback) {
    callback(null, cssData.TargetHeatingCoolingState);
  })
  .on('set',function(value, callback) {
      cssData.TargetHeatingCoolingState=value;
      console.log( "Characteristic TargetHeatingCoolingState changed to %s",value);
      callback();
    });

 ThermostatService.getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    callback(null, cssData.CurrentTemperature);
  })
  .on('set',function(value, callback) {
      cssData.CurrentTemperature=value;
      console.log( "Characteristic CurrentTemperature changed to %s",value);
      callback();
    });

 ThermostatService.getCharacteristic(Characteristic.TargetTemperature)
  .on('get', function(callback) {
    callback(null, cssData.TargetTemperature);
  })
  .on('set',function(value, callback) {
      cssData.TargetTemperature=value;
      console.log( "Characteristic TargetTemperature changed to %s",value);
      callback();
    });

 ThermostatService.getCharacteristic(Characteristic.TemperatureDisplayUnits)
  .on('get', function(callback) {
    callback(null, cssData.TemperatureDisplayUnits);
  })
  .on('set',function(value, callback) {
      cssData.TemperatureDisplayUnits=value;
      console.log( "Characteristic TemperatureDisplayUnits changed to %s",value);
      callback();
    });
    
    
var SerialPort = require('serialport');
var sleep = require('sleep');

// initialize UART and CO2 sensor
const buf = Buffer.from([0xff, 0x01, 0x99, 0x00, 0x00, 0x00, 0x07, 0xd0, 0x8f]);
var uart = new SerialPort('/dev/serial0', {baudRate: 9600});
sleep.sleep(2);
uart.write(buf);
sleep.msleep(100);
uart.read(9);

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

cssAccessory
  .addService(Service.AirQualitySensor, "CO2")
  .getCharacteristic(Characteristic.CarbonDioxideLevel)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, CO2_SENSOR.getLevel());
  });
  
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
    
    

var sensorLib = require('node-dht-sensor');

var sensorType = 22; // 11 for DHT11, 22 for DHT22 and AM2302
var innerSensorPin  = 17;  // The GPIO pin number for sensor signal
var outerSensorPin  = 4;  // The GPIO pin number for sensor signal

// here's a temperature sensor device that we'll expose to HomeKit
var dhtDataInner = {
  currentTemperature: 20,
  currentHumidity: 30,
  getTemperature: function() { 
    console.log("Getting the current temperature!");
    return dhtDataInner.currentTemperature;
  },
  getHumidity: function() { 
    console.log("Getting the current humidity!");
    return dhtDataInner.currentHumidity;
  },
  read() {
    var data = sensorLib.read(sensorType, innerSensorPin);
    console.log("DHT sensor on pin " + innerSensorPin + " t=" + data.temperature + " h=" + data.humidity);
    dhtDataInner.currentTemperature = data.temperature.toFixed(1);
    dhtDataInner.currentHumidity = data.humidity.toFixed(1);
  }
}

// here's a temperature sensor device that we'll expose to HomeKit
var dhtDataOuter = {
  currentTemperature: 20,
  currentHumidity: 30,
  getTemperature: function() { 
    console.log("Getting the current temperature!");
    return dhtDataOuter.currentTemperature;
  },
  getHumidity: function() { 
    console.log("Getting the current humidity!");
    return dhtDataOuter.currentHumidity;
  },
  read() {
    var data = sensorLib.read(sensorType, outerSensorPin);
    console.log("DHT sensor on pin " + innerSensorPin + " t=" + data.temperature + " h=" + data.humidity);
    dhtDataOuter.currentTemperature = data.temperature.toFixed(1);
    dhtDataOuter.currentHumidity = data.humidity.toFixed(1);
  }
}

cssAccessory
  .addService(Service.TemperatureSensor, "T Inside")
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, dhtDataInner.getTemperature());
  });

cssAccessory
  .addService(Service.HumiditySensor, "H Inside")
  .getCharacteristic(Characteristic.CurrentRelativeHumidity )
  .on('get', function(callback) {
    
    // return our current value
    callback(null, dhtDataInner.getHumidity());
  });
  
cssAccessory
  .addService(Service.TemperatureSensor, "T Outside")
  .getCharacteristic(Characteristic.CurrentTemperature)
  .on('get', function(callback) {
    
    // return our current value
    callback(null, dhtDataOuter.getTemperature());
  });

cssAccessory
  .addService(Service.HumiditySensor, "H Outside")
  .getCharacteristic(Characteristic.CurrentRelativeHumidity )
  .on('get', function(callback) {
    
    // return our current value
    callback(null, dhtDataOuter.getHumidity());
  });
  
// sensors reading every 3 seconds
setInterval(function() {
  
  dhtDataInner.read();
  dhtDataOuter.read();
  
  // update the characteristic value so interested iOS devices can get notified
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, dhtDataInner.currentTemperature);
    
  sensor
    .getService(Service.HumiditySensor)
    .setCharacteristic(Characteristic.CurrentRelativeHumidity, dhtDataInner.currentHumidity);
    
  sensor
    .getService(Service.TemperatureSensor)
    .setCharacteristic(Characteristic.CurrentTemperature, dhtDataOuter.currentTemperature);
    
  sensor
    .getService(Service.HumiditySensor)
    .setCharacteristic(Characteristic.CurrentRelativeHumidity, dhtDataOuter.currentHumidity);
    
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






var Gpio = require('pigpio').Gpio;
var GPIOOnOff = require('onoff').Gpio;

// here's a fake hardware device that we'll expose to HomeKit
var FAKE_FAN = {
  powerOn: false,
  rSpeed: 100,
  pwmControl: new Gpio(12, {mode: Gpio.OUTPUT}),
  powerOnRelay: new GPIOOnOff(26, 'out'),
  speed_1_Relay: new GPIOOnOff(19, 'out'),
  speed_2_Relay: new GPIOOnOff(13, 'out'),
  speed_3_Relay: new GPIOOnOff(6, 'out'),
  setPowerOn: function(on) {
    if(on){
      //put your code here to turn on the fan
      FAKE_FAN.powerOn = on;
    }
    else{
      //put your code here to turn off the fan
      FAKE_FAN.powerOn = on;
    }
  },
  setSpeed: function(value) {
    console.log("Setting fan rSpeed to %s", value);
    FAKE_FAN.rSpeed = value;
    //put your code here to set the fan to a specific value
  },
  identify: function() {
    //put your code here to identify the fan
    console.log("Fan Identified!");
  }
}

// Add the actual Fan Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`

var fan = cssAccessory.addService(Service.Fan, "Fan") 

// listen for the "identify" event for this Accessory
fan.on('identify', function(paired, callback) {
  FAKE_FAN.identify();
  callback(); // success
});

// Add the actual Fan Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
fan
  .addService(Service.Fan, "Fan") // services exposed to the user should have "names" like "Fake Light" for us
  .getCharacteristic(Characteristic.On)
  .on('set', function(value, callback) {
    FAKE_FAN.setPowerOn(value);
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

    if (FAKE_FAN.powerOn) {
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
    callback(null, FAKE_FAN.rSpeed);
  })
  .on('set', function(value, callback) {
    FAKE_FAN.setSpeed(value);
    callback();
  })

// Setup fans speed control 
setInterval(function () {
  //FAKE_FAN.pwmControl.pwmWrite(Math.floor(FAKE_FAN.rSpeed * 255 / 100) * !FAKE_FAN.powerOn);
  FAKE_FAN.pwmControl.pwmWrite(255 * !FAKE_FAN.powerOn);
  FAKE_FAN.powerOnRelay.writeSync(FAKE_FAN.powerOn ? 0 : 1);
  
  // turn on corresponding relay according to fan speed value
   switch (true) {        
     case (FAKE_FAN.rSpeed < 33):
         FAKE_FAN.speed_3_Relay.writeSync(1);
         FAKE_FAN.speed_2_Relay.writeSync(1);
         FAKE_FAN.speed_1_Relay.writeSync(0);
         break;
     case (FAKE_FAN.rSpeed >= 33 && FAKE_FAN.rSpeed < 66 ):
         FAKE_FAN.speed_3_Relay.writeSync(1);
         FAKE_FAN.speed_1_Relay.writeSync(1);
         FAKE_FAN.speed_2_Relay.writeSync(0);
         break;
     case (FAKE_FAN.rSpeed >= 66):
         FAKE_FAN.speed_2_Relay.writeSync(1);
         FAKE_FAN.speed_1_Relay.writeSync(1);
         FAKE_FAN.speed_3_Relay.writeSync(0);
         break;
   }
}, 500);// update fan speed once per 500 milliseconds
    
//ThermostatService.addLinkedService(FanService);
cssAccessory.setPrimaryService(ThermostatService);
