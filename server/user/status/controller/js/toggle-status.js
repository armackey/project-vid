var User = require('../../../model');

var obj = {};

obj.setOffline = function(socketid) {

  User.findOne({'socketid': socketid}, function(err, user) {
    
    if (err) throw err;
    if (!user) return;

    user.socketid = '';
    user.inCall = false;
    user.isOnline = false;
    user.inMatching = false;
    user.save(function(err) {
      if (err) throw err;
    });

    console.log(user.name, ': inMatching ', user.inMatching);
  });
};

obj.isOnline = function(token, socketid) {
  console.log('currently checking for token change to id');
  if (!token) return;
  User.findOne({'token': token}, function(err, user) {
    if (err) throw err;
    if (!user) return; 

    user.socketid = socketid;
    user.isOnline = true;
    user.save(function(err) {
      if (err) throw err;
    });
  });
};

module.exports = obj;