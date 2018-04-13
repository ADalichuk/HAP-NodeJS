var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var CarbonDioxideSensor = require('./modules/CarbonDioxideSensor.js');
var DHTSensor = require('./modules/DHTSensor.js');
var FanController = require('./modules/FanController.js');
var ThermostatController = require('./modules/ThermostatController.js');
var sensorLib = require('node-dht-sensor');

var enableLogging = true;

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

//var THERMOSTAT_CONTROLLER = new ThermostatController({displayName: "Thermostat", isLoggingEnabled: enableLogging});
//cssAccessory.addService(Service.Thermostat, THERMOSTAT_CONTROLLER.getService());
    
// ADD FAN SERVICE ------------------------------------------------------------
var fanService = cssAccessory.addService(Service.Fan, "Fan");
var FAN_CONTROLLER = new FanController(enableLogging);
fanService
  .getCharacteristic(Characteristic.On)
  .on('set', FAN_CONTROLLER.setOnOffStatus.bind(FAN_CONTROLLER))
  .on('get', FAN_CONTROLLER.getOnOffStatus.bind(FAN_CONTROLLER));
fanService
  .addCharacteristic(Characteristic.RotationSpeed)
  .on('set', FAN_CONTROLLER.setSpeed.bind(FAN_CONTROLLER))
  .on('get', FAN_CONTROLLER.getSpeed.bind(FAN_CONTROLLER));

var controlAirQualityOnOff = true; 
var airQualityControllerService = cssAccessory.addService(Service.Switch, "Air Quality Control");
airQualityControllerService
  .getCharacteristic(Characteristic.On)
  .on('set', function(isEnabled, callback){
    console.log("switch status write");
    callback();
    controlAirQualityOnOff = isEnabled;})
  .on('get', function(callback){
    console.log("switch status read");
    callback(null, controlAirQualityOnOff);});
  
// ADD AIR QUALITY SENSOR SERVICE-----------------------------------------------
var CO2_SENSOR = new CarbonDioxideSensor(enableLogging);
var co2Service = cssAccessory.addService(Service.AirQualitySensor, "CO² Sensor");
co2Service
  .getCharacteristic(Characteristic.CarbonDioxideLevel)
  .on('get', CO2_SENSOR.getLevel.bind(CO2_SENSOR));
co2Service
  .getCharacteristic(Characteristic.AirQuality)
  .on('get', CO2_SENSOR.getAirQuality.bind(CO2_SENSOR));  

// ADD TEMPERATURE AND HUMIDITY SENSORS SERVICES--------------------------------
var DHT_SENSOR_INFLOW = new DHTSensor(sensorLib, 17/*outflowSensorPin*/, enableLogging);
var DHT_SENSOR_OUTFLOW = new DHTSensor(sensorLib, 4/*inflowSensorPin*/, enableLogging);
    
var Inflow_TemperatureService = cssAccessory.addService(Service.TemperatureSensor, "Inflow Temperature");
var Inflow_HumidityService = cssAccessory.addService(Service.HumiditySensor, "Inflow Humidity");
Inflow_TemperatureService
    .getCharacteristic(Characteristic.CurrentTemperature)
    .on('get', DHT_SENSOR_INFLOW.getTemperature.bind(DHT_SENSOR_INFLOW));
Inflow_HumidityService
    .getCharacteristic(Characteristic.CurrentRelativeHumidity)
    .on('get', DHT_SENSOR_INFLOW.getHumidity.bind(DHT_SENSOR_INFLOW));
    
// var Outflow_TemperatureService = cssAccessory.addService(Service.TemperatureSensor, "Outflow Temperature");
// var Outflow_HumidityService = cssAccessory.addService(Service.HumiditySensor, "Outflow Humidity");
// Outflow_TemperatureService
    // .getCharacteristic(Characteristic.CurrentTemperature)
    // .on('get', DHT_SENSOR_OUTFLOW.getTemperature.bind(DHT_SENSOR_OUTFLOW));
// Outflow_HumidityService
    // .getCharacteristic(Characteristic.CurrentRelativeHumidity)
    // .on('get', DHT_SENSOR_OUTFLOW.getHumidity.bind(DHT_SENSOR_OUTFLOW));

// sensors reading every 3 seconds
setInterval(function() {
  DHT_SENSOR_INFLOW.read();
  Inflow_TemperatureService.setCharacteristic(Characteristic.CurrentTemperature, DHT_SENSOR_INFLOW.getTemperature());
  Inflow_HumidityService.setCharacteristic(Characteristic.CurrentRelativeHumidity, DHT_SENSOR_INFLOW.getHumidity);

  //DHT_SENSOR_OUTFLOW.read();
  CO2_SENSOR.read();
 
  co2Service
    .setCharacteristic(Characteristic.AirQuality, CO2_SENSOR.getAirQuality())
    .setCharacteristic(Characteristic.CarbonDioxideLevel, CO2_SENSOR.getLevel());
    
  if (controlAirQualityOnOff){
    if (CO2_SENSOR.getAirQuality() > 3){
      if (enableLogging)
        console.log("Forcing fan due to high CO² level");
      FAN_CONTROLLER.forceSpeed = true;
    }
    else if (CO2_SENSOR.getAirQuality() == 1){
      FAN_CONTROLLER.forceSpeed = false;
    }
  }
  else
  {
    FAN_CONTROLLER.forceSpeed = false;
  }
}, 3000);

setInterval(function() {
  FAN_CONTROLLER.updateSpeed();
}, 500);
    
//ThermostatService.addLinkedService(FanService);
//cssAccessory.setPrimaryService(ThermostatService);
