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
        console.log(msgs);

        for (var i = 0; i < msgs.length; i++) {
          messages.push({id: msgs[i].id, messages: msgs[i].content});
        }

        res.send(messages);

    });
  });
};


exports.saveMsg = function(data) {
  
  var id = data.id;
  var deferred = Q.defer();
  
  Message.findOne({'_id': id}, function(err, thread) {

    thread.content.push({from: data.from, message: data.message});
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
  
  var id = req.body.id;

  Message.findOne({'_id': id}, function(err, msgs) {

    // send the messages as they are so the client can count the difference of what's new vs old msgs
    res.send(msgs);

    for (var i = 0; i < msgs.content.length; i++) {
      msgs.content[i].unread = false;
    }
    
    msgs.save();
  });
};

