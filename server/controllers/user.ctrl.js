var User = require('../models/user.model');
var Message = require('../models/message.model');
var AccessToken = require('twilio').AccessToken;
var ConversationsGrant = AccessToken.ConversationsGrant;
var Call = require('../Events/call.events');
var EE = require('events').EventEmitter;
var emitter = new EE();
var Q = require('q');
var roomStore = {};

require('dotenv').load();







/*
***************************************************************************************
***************************************************************************************
***************************************************************************************
getToken should happen once during runtime. 
***************************************************************************************
***************************************************************************************
***************************************************************************************
*/








emitter.on('removed-from-list', function(id) {
  console.log('ON : removed-from-list');
  // findMatches(id);
});









