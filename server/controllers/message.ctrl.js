var User = require('../models/user.model');
var Message = require('../models/message.model');
var Q = require('q');
var moment = require('moment');


setInterval(function() {
  Message.find(function(err, thread) {
    for (var i = 0, j = thread.length; i < j; i++) {
      handleExpiredPendingCalls(thread[i].content.messages, thread[i]);
    }
  });
}, 1000);

function handleExpiredPendingCalls(arg, thread)  {
  for (var i = 0, j = arg.length; i < j; i++) {
    if (!arg[i].denied && arg[i].pending_call && !arg[i].expired) {
      var expiredCallTime = parseInt(moment(arg[i].created_at).format('x')) + 300000; // CHANGE WHEN READY
      var now = moment(new Date()).format('x'); 
      if (now >= expiredCallTime) {
        arg[i].expired = true;
      }
      thread.save();
    }
  }
}

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
  
  var id = data.threadId;
  var deferred = Q.defer();
  
  Message.findOne({'_id': id}, function(err, thread) {

    thread.content.messages.push({from: data.from, message: data.message, pending_call: data.pending_call, user_id: data.userId, video_request: data.videoRequest});
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

exports.togglePendingAndDenied = function(bool, threadId, messageId) {
  
  Message.findOne({'_id': threadId}, function(err, thread) {
   thread.content.messages.filter(function(message) {
      if (parseInt(message._id) === parseInt(messageId)) {
        return message;
      }
    }).map(function(elem) {
      if (bool) { 
        elem.pending_call = false; // if they have answered, it's no longer pending
      } else {
        elem.denied = true;
      }

      thread.save();
      
    });
  });
};

exports.getMessages = function(req, res) {
  
  var threadId = req.body.threadId,
      userId = req.body.userId;

  Message.findOne({'_id': threadId}, function(err, msgs) {

    // check if message was sent by them
    // if it wasn't then mark as read(unread=false)******************************************

    // send the messages as they are so the client can count the difference of what's new vs old msgs
    res.send(msgs);
    if (msgs === null) {
      return;
    }

    for (var i = 0; i < msgs.content.messages.length; i++) {

      // console.log(userId, 'userId');
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


