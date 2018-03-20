var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var CarbonDioxideSensor = require('./modules/CarbonDioxideSensor.js');
var DHTSensor = require('./modules/DHTSensor.js');
var FanController = require('./modules/FanController.js');
var ThermostatController = require('./modules/ThermostatController.js');

var enableLogging = false;

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

var THERMOSTAT_CONTROLLER = new ThermostatController({displayName: "Thermostat", isLoggingEnabled: enableLogging});
cssAccessory.addService(Service.Thermostat, THERMOSTAT_CONTROLLER.getService());
    
var FAN_CONTROLLER = new FanController({displayName: "Fan", isLoggingEnabled: enableLogging});
cssAccessory.addService(Service.Fan, FAN_CONTROLLER.getService());

var CO2_SENSOR = new CarbonDioxideSensor(enableLogging);
CO2_SENSOR.initialize();
cssAccessory.addService(Service.AirQualitySensor, CO2_SENSOR.getService());

var innerSensorPin  = 17;  // The GPIO pin number for sensor signal
var outerSensorPin  = 4;  // The GPIO pin number for sensor signal

var DHT_SENSOR_INFLOW = new DHTSensor(
    "Inflow Temperature",
    "Inflow Humidity",
    innerSensorPin, 
    enableLogging);
    
var DHT_SENSOR_OUTFLOW = new DHTSensor(
    "Outflow Temperature",
    "Outflow Humidity",
    outerSensorPin, 
    enableLogging);
    
cssAccessory.addService(Service.TemperatureSensor, DHT_SENSOR_INFLOW.getTemperatureService());
cssAccessory.addService(Service.HumiditySensor, DHT_SENSOR_INFLOW.getHumidityService());
//cssAccessory.addService(Service.TemperatureSensor, DHT_SENSOR_OUTFLOW.getTemperatureService());
//cssAccessory.addService(Service.HumiditySensor, DHT_SENSOR_OUTFLOW.getHumidityService());

// sensors reading every 3 seconds
setInterval(function() {
  DHT_SENSOR_INFLOW.read();
  //DHT_SENSOR_OUTFLOW.read();
  CO2_SENSOR.read();
}, 3000);

setInterval(function() {
  FAN_CONTROLLER.updateSpeed();
}, 500);
    
//ThermostatService.addLinkedService(FanService);
cssAccessory.setPrimaryService(ThermostatService);
