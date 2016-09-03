var User = require('../../../model');
var moment = require('moment');

setInterval(function() {
  User.find(function(err, users) {
    users.filter(function(callList, i) {
      if (callList.pending_calls.length > 0) {
        return callList;
      }        
    }).map(function(call, i) {
      var expiredCallTime = parseInt(moment(call.pending_calls[i].created_at).format('x')) + 300000; // CHANGE WHEN READY
      var now = moment(new Date()).format('x'); 
      if (now >= expiredCallTime) {
        call.pending_calls.splice(i, 1);
      }
        call.save();
    });
  });
}, 1000);

// call has been accepted or denied. must remove it from our pending list
exports.removePendingCaller = function(receiverId, callerId) {
  
  var deferred = Q.defer();

  User.findOne({'_id': receiverId}, function(err, user) {
    if (err) throw err;
    user.pending_calls.forEach(function(elem, i) {
      if (elem.user_id === callerId) {

        user.pending_calls.splice(i, 1);
        user.save();
        return deferred.resolve(true);
      } else {
        return deferred.reject(false);
      }
    });
  });
  return deferred.promise;
};

exports.addCallerToUpcomingCalls = function(receiver, caller) {
  User.findOne({'_id': receiver.id}, function(err, user) {
    user.upcoming_calls.push({user_id: caller.id, name: caller.name});
    user.save();
  });
};

exports.callResponse = function(req, res) {

};

// call pending adds the caller to a list, waiting to be answered or denied
exports.callPending = function(receiver, caller) {

  User.findOne({'_id': receiver.id}, function(err, user) {

    if (user.pending_calls.length === 0) {
      user.pending_calls.push({name: caller.name, user_id: caller.id});
      user.save(function(err) {
        if (err) throw err;
      });
      return;
    }

    for (var i = 0, j = user.pending_calls.length; i < j; i++) {
      if (user.pending_calls[i].user_id === caller.id) {
        console.log('caller is already on list');
        return;
      }
    }
    console.log('caller added to list');
    user.pending_calls.push({name: caller.name, user_id: caller.id});
    user.save(function(err) {
      if (err) throw err;
    });
    
  });
};