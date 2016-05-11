var Message = require('../models/message.model');
var Q = require('q');

exports.getMessages = function() {
  Message.find({
    'room': req.query.room.toLowerCase()
  }).exec(function(err, msgs) {
    res.json(msgs);
  });
};

exports.newMsg = function(data) {
  
  var deferred = Q.defer();

  var newMsg = new Chat({
    name: data.username,
    content: data.message,
    room: data.room.toLowerCase(),
    created: new Date()
  });
  newMsg.save(function(err, msg) {
    deferred.resolve(msg);
  });

  return deferred.promise;
};

exports.getMsgThread = function(req, res) {
  var room = req.body.room;
  Message.find({'room': room}, function(err, room) {
    console.log(room);
  });
};

