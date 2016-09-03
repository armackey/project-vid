var handleMatches = require('./js/handle-matches');
var handleLikes = require('./js/handle-likes');
var handleMisc = require('./js/handle-misc');
var handleDirectCalls = require('./js/handle-direct-calls');

// handle matches

exports.getToken = function(req, res) {
  return handleMatches.getToken();
};

exports.getMatchInfo = function(req, res) {
  return handleMatches.getMatchInfo(req, res);
};

exports.searchForMatch = function(req, res) {
  return handleMatches.searchForMatch(req, res);
};

// handle misc

exports.findSocketId = function(ids) {
  return handleMisc.findSocketId(ids);
};

exports.niceToMeetYou = function(req, res) {
  return handleMisc.niceToMeetYou(req, res);
};

exports.toggleAvail = function(req, res) {
  return handleMisc.toggleAvail(req, res);
};

exports.toggleInCall = function(id, inCall) {
  return handleMisc.toggleInCall(id, inCall);
};

exports.inMatching = function(req, res) {
  return handleMisc.inMatching(req, res);
};


// handle direct calls

exports.removePendingCaller = function(receiverId, callerId) {
  return handleDirectCalls.removePendingCaller(receiverId, callerId);
};

exports.addCallerToUpcomingCalls = function(receiver, caller) {
  return handleDirectCalls.addCallerToUpcomingCalls(receiver, caller);
};

exports.callPending = function(receiver, caller) {
  return handleDirectCalls.callPending(receiver, caller);
};


