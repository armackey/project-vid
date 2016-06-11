var User = require('../models/user.model');
var Message = require('../models/message.model');
var Q = require('q');

exports.getThreads = function(req, res) {

  var token = req.body.token;

  User.findOne({'token': token}, function(err, user) {
    if (err) throw err;

    if (!user) {
      res.send({
        view: 'home'
      });
      return;
    }

    Message.find({'created_by': user.id})
      .sort('-last_message_date')
      .exec(function(err, msgs) {

        if (err) throw err;

        var messages = [];

        for (var i = 0; i < msgs.length; i++) {
          messages.push({id: msgs[i].id, content: msgs[i].content});
        }

        res.send(messages);

    });
  });
};


exports.saveMsg = function(data) {
  
  var id = data.id;
  var deferred = Q.defer();
  
  Message.findOne({'_id': id}, function(err, thread) {

    thread.content.messages.push({from: data.from, message: data.message});
    thread.last_message_date = new Date();

    thread.save(function(err) {
      if (err) throw err;

      User.find({'_id': { $in: thread.created_by}}, function(err, users) {

        if (err) {
          deferred.reject(users);
        } else {
          deferred.resolve(users);  
        }
        
      });
        
    });

  });
  return deferred.promise;
};

exports.getMessages = function(req, res) {
  
  var threadId = req.body.threadId,
      userId = req.body.userId;

  Message.findOne({'_id': threadId}, function(err, msgs) {

    // check if message was sent by them
    // if it wasn't then mark as read(unread=false)******************************************

    // send the messages as they are so the client can count the difference of what's new vs old msgs
    res.send(msgs);

    for (var i = 0; i < msgs.content.messages.length; i++) {
      console.log(userId);
      if (!msgs.content.users[i]) continue;
      if (msgs.content.users[i]._id === userId) {
        console.log('msgs.content.messages[i].unread');
        console.log(msgs.content.messages[i].unread);
        msgs.content.messages[i].unread = false;  
      }
    }
    
    msgs.save();
  });
};


