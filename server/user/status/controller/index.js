var toggler = require('./js/toggle-status.js');

exports.isOnline = function(token, socketid) {
    return toggler.isOnline(socketid);
};

exports.setOffline = function(socketid) {
    return toggler.setOffline(socketid);
};