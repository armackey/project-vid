var User = require('../models/user.model');
var Q = require('q');
var moment = require('moment');

// User.find(function(err, users) {
//   users.forEach(function(elems, i) {
//     console.log(elems.people_met);
//     elems.people_met.splice(i, 1);
//     elems.save();
//   });
// });

/*
  if users have pending calls, they have 5 minutes to answer before it expires
*/
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

exports.findSocketId = function(ids) {
  var deferred = Q.defer();

  User.find({'_id': { $in: ids }}, function(err, user) {
    if (user) 
      deferred.resolve(user);
    else 
      deferred.reject(user);
  });
  return deferred.promise;
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

exports.callResponse = function(req, res) {

};


exports.niceToMeetYou = function(req, res) {
  var token = req.body.myToken.token,
      otherId = req.body.otherId,
      name = req.body.name;

  User.findOne({'token': token}, function(err, user) {
    console.log('found user');
    handleAlreadyMet(otherId, user).then(function(bool) { // check if users already met
      console.log(bool, 'never met');
      if (bool === true) {
        user.people_met.push({user_id: otherId, name: name});

        user.save(function(err) {
          if (err) throw err;
        });
      }
    });

  });

};


function handleAlreadyMet(otherId, user) {
  var deferred = Q.defer();
  if (user.people_met.length < 1) {
    deferred.resolve(true);
  } else {
    user.people_met.forEach(function(elem) { // map over users met,
      return elem.user_id === otherId ? deferred.reject(false) : deferred.resolve(true);  
    });
  }
  return deferred.promise;
}

exports.toggleAvail = function(req, res) {
  var token = req.body.token,
      avail = req.body.avail;

  if (auth(token, res) === false) {
    return;
  }

  User.findOne({token: token}, function(err, user) {

    user.available = avail;
    user.save(function(err, user) {
      if (err) throw err;
      res.send({avail: avail});
    });
  });

};








