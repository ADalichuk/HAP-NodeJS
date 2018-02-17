var Accessory = require('../').Accessory;
var Service = require('../').Service;
var Characteristic = require('../').Characteristic;
var uuid = require('../').uuid;
var err = null; // in case there were any problems

// here's a fake hardware device that we'll expose to HomeKit
var FILTER = {
    filterChange: Characteristic.FilterChangeIndication.FILTER_OK,
    filterLifeLevel: 90,
    resetFilterIndication: function() {
        console.log("Reseting filter state");
        filterChange = Characteristic.FilterChangeIndication.FILTER_OK;
    },
    identify: function() {
        console.log("Identify the outlet.");
    }
}

// Generate a consistent UUID for our filter
// This is the Accessory that we'll return to HAP-NodeJS
var filter = exports.accessory = new Accessory('filter', uuid.generate('hap-nodejs:accessories:Filter'));

// Add properties for publishing (in case we're using Core.js and not BridgedCore.js)
filter.username = "1A:2B:3C:4D:5D:FF";
filter.pincode = "031-45-154";

// set some basic properties (these values are arbitrary and setting them is optional)
filter
  .getService(Service.AccessoryInformation)
  .setCharacteristic(Characteristic.Manufacturer, "MY COMPANY")
  .setCharacteristic(Characteristic.Model, "HEPA-1")
  .setCharacteristic(Characteristic.SerialNumber, "A1S2NASF88EW");

// listen for the "identify" event for this Accessory
filter.on('identify', function(paired, callback) {
  FILTER.identify();
  callback(); // success
});

// Add the actual filter Service and listen for change events from iOS.
// We can see the complete list of Services and Characteristics in `lib/gen/HomeKitTypes.js`
filter
  .addService(Service.FilterMaintenance, "Filter") // service exposed to the user 
  .getCharacteristic(Characteristic.ResetFilterIndication)
  .on('set', function(value, callback) {
    FILTER.resetFilterIndication();
    callback(); // Our fake filter is synchronous - this value has been successfully set
  });

filter
  .getService(Service.FilterMaintenance)
  .getCharacteristic(Characteristic.FilterChangeIndication)
  .on('get', function(callback) {
    // this event is emitted when you ask Siri directly whether your filter is ok or not.

    var err = null; // in case there were any problems

    if (FILTER.filterChange == Characteristic.FilterChangeIndication.FILTER_OK) {
      console.log("Is filter ok ? Yes.");
      callback(err, Characteristic.FilterChangeIndication.FILTER_OK);
    }
    else {
      console.log("Is filter ok ? No.");
      callback(err, Characteristic.FilterChangeIndication.CHANGE_FILTER);
    }
  });
  
filter
  .getService(Service.FilterMaintenance)
  .getCharacteristic(Characteristic.FilterLifeLevel)
  .on('get', function(callback) {

    // this event is emitted when you ask Siri directly whether your filter is ok or not.

    var err = null; // in case there were any problems

    callback(err, filterLifeLevel);
  }); 
