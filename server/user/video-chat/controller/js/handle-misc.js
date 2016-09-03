var User = require('../../../model');
var Q = require('Q');

var obj = {};

obj.findSocketId = function(ids) {
  var deferred = Q.defer();

  User.find({'_id': { $in: ids }}, function(err, user) {
    if (user) 
      deferred.resolve(user);
    else 
      deferred.reject(user);
  });
  return deferred.promise;
};

obj.niceToMeetYou = function(req, res) {
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

obj.toggleAvail = function(req, res) {
  var token = req.body.token,
      avail = req.body.avail;

  User.findOne({token: token}, function(err, user) {

    user.available = avail;
    user.save(function(err, user) {
      if (err) throw err;
      res.send({avail: avail});
    });
  });

};

obj.toggleInCall = function(id, inCall) {
  User.findOne({'_id': id}, function(err, user) {
    if (err) throw err;
      user.inCall = inCall;
      user.save();
      console.log(user.name, 'inCall: ', user.inCall);
  });
};

obj.inMatching = function(req, res) {
  var id = req.body.id;
  var inMatch = req.body.inMatch.inMatch;
  console.log(inMatch);
  User.findOne({'_id': id}, function(err, user) {
    if (err) throw err;
      user.inMatching = inMatch;
      user.save();
      console.log(user.name, 'inMatching: ', user.inMatching);
  });
};

module.exports = obj;


