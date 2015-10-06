// Tries to pull out the list of vendor modules from the package.json file, which
// allows us to split vendors into a separate bundle.
//
// Edit the switch for modules that are different from their package names.

var fs = require('fs');
var _ = require('lodash');

var data = fs.readFileSync('package.json', 'utf8');
var details = JSON.parse(data);
var dependencies = _.flatten(Object.keys(details.dependencies));

module.exports = dependencies;
