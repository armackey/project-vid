var handlePreferences = require('./js/handle-preferences');

exports.setPreferences = function(req, res) { return handlePreferences.setPreferences(req, res);};
exports.getPreferences = function(req, res) { return handlePreferences.getPreferences(req, res);};
exports.getStats = function(req, res) { return handlePreferences.getStats(req, res);};
exports.getSelectionList = function(req, res) { return handlePreferences.getSelectionList(req, res);};
exports.updateSelection = function(req, res) { return handlePreferences.updateSelection(req, res);};
exports.submitBirthday = function(req, res) { return handlePreferences.submitBirthday(req, res);};