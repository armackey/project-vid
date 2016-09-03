var User = require('../../../model');
var Message = require('../../../../models/message.model');
var Q = require('q');
var Room = require('./handle-room-store');




module.exports = {
  itsMutual: function(room, photo, name, id) {
    
    var users = Room.getRoom(room);

    handleMutualLikes(users, id);
    
    updateThread(users, name, photo, id).then(function(thread) {
      thread.content.messages.push({from: name});
      thread.content.users.push({userId: id, photo: photo});
      thread.save();
    });
  },

  tallyLikes: function(userId) {
    User.findOne({'_id': userid}, function(err, user) {
      if (err) throw err;
      if (!user) return;
      user.total_likes+=1;
      user.save(function(err) {
        if (err) throw err;
      });
    });
  }
};


function updateThread(users, name, photo, id) {

  var deferred = Q.defer();

  Message.findOne({'created_by': users}, function(err, thread) {
    if (err) throw err;
    if (thread !== null && thread.content.users.length >= 2) { // checks if thread is already created with both users
      return;
    }

    if (thread === null) { // if null create thread
      createThread(users, name, photo, id);
      deferred.reject(thread);
    } else {
      deferred.resolve(thread);
    }

  });
  return deferred.promise;
}

function createThread(users, name, photo, id) {

  Message.find({'created_by': users}, function(err, users) {
    if (users) { // checks if users are already associated to a thread. if so, don't create new thread.
      return;
    }
  });

  var msg = new Message();

  msg.content.messages = {
    message: 'Yay! You two liked each other! Continue the conversation. -Blur',
  };
  msg.content.messages.push({from: name});
  msg.content.users.push({userId: id, photo: photo});
  msg.created_by = users;
  msg.save();
}

function handleMutualLikes(users, userId) {
  
  User.find({'_id': {$in: users}}, function(err, userArray) {
    
    var user = userArray.filter(function(elem, i, array) {
      // basically finding currentUser in list of people they've met
      return elem._id.toString() !== userId.toString() ? elem : false; // returns the user you just met.
    }).map(function(elem, i) {
      console.log(elem);
      if (elem.people_met[i].user_id === userId) { 
        elem.people_met[i].mutual = true;
        elem.people_met[i].liked = true;
      }
      elem.save();
    });
  });
}





