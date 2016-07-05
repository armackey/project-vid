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

exports.itsMutual = function(room, photo, name, id) {

  var users;
  

  Object.keys(roomStore).forEach(function(key) {
    if (key === room) {
      users = [roomStore[key][0].id, roomStore[key][1].id];
    }
  });

  handleMutualLikes(users, id);
  
  updateThread(users, name, photo, id).then(function(thread) {
    thread.content.messages.push({from: name});
    thread.content.users.push({userId: id, photo: photo});
    thread.save();
  });
};

function updateThread(users, name, photo, id) {

  var deferred = Q.defer();

  Message.findOne({'created_by': users}, function(err, thread) {
    if (err) throw err;
    if (thread !== null && thread.content.users.length >= 3) { // checks if thread is already created with both users
      console.log(thread);
      console.log('thread is already created!!!!');console.log('thread is already created!!!!');console.log('thread is already created!!!!');console.log('thread is already created!!!!');
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

exports.setOffline = function(socketid) {

  User.findOne({'socketid': socketid}, function(err, user) {
    
    if (err) throw err;
    if (!user) return;

    user.socketid = '';
    user.inCall = false;
    user.available = false;
    user.isOnline = false;
    user.save(function(err) {
      if (err) throw err;
    });
  });
};


exports.tallyLikes = function(userid) {
  User.findOne({'_id': userid}, function(err, user) {
    if (err) throw err;
    if (!user) return;
    user.total_likes+=1;
    user.save(function(err) {
      if (err) throw err;
    });
  });
};

exports.isOnline = function(token, socketid) {
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


exports.getMatchInfo = function(req, res) {
  // iterates over roomStore to find whom they're matched with using the matched id
  var id = req.body.from;
  console.log('from', id);
  Object.keys(roomStore).forEach(function(room){
    for (var user = 0; user < roomStore[room].length; user++) {
      if (roomStore[room][user].id === id) {
        res.send({
          room: room,
          name: roomStore[room][user].name
        });
      }
    }
  });
};

/*
***************************************************************************************
***************************************************************************************
***************************************************************************************
getToken should happen once during runtime. 
***************************************************************************************
***************************************************************************************
***************************************************************************************
*/

exports.getToken = function(req, res) {
  var myToken = req.body.token;

  if (auth(myToken, res) === false) {
    return;
  }
  User.findOne({'token': myToken}, function(err, user) {

    var identity = user._id;
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    var token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET
    );
    
    token.identity = identity;
    
    // Assign the generated identity to the token
    //grant the access token Twilio Video capabilities
    var grant = new ConversationsGrant();
    grant.configurationProfileSid = process.env.TWILIO_CONFIGURATION_SID;
    token.addGrant(grant);
    // Serialize the token to a JWT string and include it in a JSON response
    user.available = true;
    user.save();
    console.log('token');
    res.send({
      identity: identity,
      token: token.toJwt(),
      name: user.name,
      likes: user.total_likes
    });

  });
};  



exports.login = function(req, res) {
  var facebookId = req.body.id;
  User.findOne({'facebookId': facebookId}, function(err, user) {

    if (user) {
      console.log('user exist');
      if (user.token !== req.body.token) {
        
        console.log('new token');console.log('new token');console.log('new token');console.log('new token');
      } 

      user.token = req.body.token;
      user.name  = req.body.name;
      user.picture = req.body.picture.data.url;
      user.location.coordinates[0] = req.body.position.longitude;
      user.location.coordinates[1] = req.body.position.latitude;
      user.save(function(err) {
        if (err) throw err;
      });

      if (!user.preferences.age.lt || !user.preferences.age.gt || !user.preferences.iWantToMeet) {
        res.send({
          view: 'preferences', 
          message: 'missing preferences',
          id: user._id,
        }); 
           
      } else {

        res.send({
          id: user._id,
          view: 'video-chat',
          message: 'welcome back',
          picture: user.picture,
          token: user.token
        });

      }

    } else {

      var newUser = new User();

      newUser.facebookId = req.body.id; 
      newUser.gender = req.body.gender;
      newUser.token = req.body.token; 
      newUser.name  = req.body.name;
      newUser.email = req.body.email;
      newUser.location.coordinates[0] = req.body.position.longitude;
      newUser.location.coordinates[1] = req.body.position.latitude;
      newUser.picture = req.body.picture.data.url;

      newUser.save(function(err) {
        if (err) throw err;

        res.send({
          id: newUser._id,
          view: 'preferences', 
          message: 'missing preferences',
          picture: newUser.picture
        }); 
      });
    }

  });
};


exports.searchForMatch = function(req, res) {
  var token = req.body.token;
  var id = req.body.id;
  findMatches(id, req, res);
};

function findMatches(id, req, res) {
  
  User.findOne({'_id': id}, function(err, user) {

    if (!user && res) {
      res.send({veiw: 'home'});
      return;
    }

    if (res) {
      if (!user.preferences.iWantToMeet || !user.preferences.age.lt || !user.preferences.age.gt || !user.age) {
        res.send({view:'preferences'});
        return;
      }
    }

    var distance = req ? req.body.distance : user.distance;

    User.find({'isOnline': true}) 
      .where({'_id': {$ne: id}})
      .where('inCall').equals(false)
      .where('location').near({ center: {type: 'Point', coordinates: [user.location.coordinates[0], user.location.coordinates[1]]}, 
        maxDistance: distance * 1609.34, spherical: true
      })
      .where('gender').equals(user.preferences.iWantToMeet)
      .where({'age': {$ne: null, $gte: user.preferences.age.gt, $lte: user.preferences.age.lt}})
      .limit(5)
      .exec(handleMatchedUsers).then(function() {
        console.log('exec');
      });

      function handleMatchedUsers(err, retrieved) {
        
        if (err) throw err;
        var call = new Call(user._id, emitter);
        var amountOnList = call.getCallList(user._id).length;

        if (amountOnList > 4) {
          return;
        }
        
        retrieved.filter(function(otherUsers) {
          
          return user.age <= otherUsers.preferences.age.lt &&
                 user.age >= otherUsers.preferences.age.gt &&
                 user.gender === otherUsers.preferences.iWantToMeet;
        })
        .forEach(function(matchedUser) {
          call.addUserToList(user._id, matchedUser.name, matchedUser._id, matchedUser.email);
        });

        var callList = call.getCallList(user._id); // returns a list of users that matches my preferences and within maxDistance
        console.log(callList);
        var matchedUser = callList[0];
        var room = createPrivateRoom(user.email, matchedUser.email);

        checkIfStillAvail(call, user._id);
        setUsersInRoom(room, [{id: user._id, name: user.name}, {id: matchedUser.user_id, name: matchedUser.name}]);

        toggleInCall([matchedUser.user_id, user._id]);

        if (!res) return;

        res.send({
          socketid: user.socketid,
          room: room,
          receiverName: matchedUser.name,
          receiverId: matchedUser.user_id,
          // receiverSocketId: matchedUser.socketid
        });
        
      }

  });
}

function checkIfStillAvail(call, id) {
  
  var list = call.getCallList(id);

  for (var i = 0, j = list.length; i < j; i++) {
    handleDBSearch(list[i]);
  }

  function handleDBSearch(user) {
    User.findOne({'_id': user.user_id}, function(err, matchedUser) {
      if (!matchedUser.inCall || !matchedUser.isOnline) {
        call.removeUserFromList(id, matchedUser._id);
      }
    });
  }
}

function toggleInCall(users) {
  User.find({'_id': {$in: users}}, function(err, users) {
    if (err) throw err;
    users.forEach(function(elem) {
      if (elem.inCall) {
        elem.inCall = false;
      } else {
        elem.inCall = true;
      }
      elem.save();
    });
  });
}

emitter.on('removed-from-list', function(id) {
  console.log('ON : removed-from-list');
  // findMatches(id);
});

function setUsersInRoom(room, users) {
  roomStore[room] = users;
}


function createPrivateRoom(caller, answer) {
  return caller+answer;
}

exports.preferences = function(req, res) {

  var id = req.body.id;
  var preferences = req.body.preferences;

  
  // if (!req.body.preferences.iWantToMeet || !req.body.preferences.ltAge || !req.body.preferences.gtAge || !req.body.gender || !req.body.myAge) {
  //   res.send({view: 'preferences'});
  //   return;
  // }

  var pref = preferences,
      myGender = preferences.gender,
      distance = preferences.distance,
      age = preferences.myAge;
  
  User.findOne({'_id': id}, function(err, user) {
    if (!user) {
      res.send({view: 'home'}); 
      return;
    }
    user.preferences = {
      iWantToMeet: pref.preferences.iWantToMeet, // gender user wants to meet
      age: {
        lt: pref.preferences.ltAge,
        gt: pref.preferences.gtAge
      }
    };
    user.distance = distance;
    user.gender = myGender;
    user.age = age;

    user.save(function(err) {
      if (err) 
        throw err;
      res.send({message: 'Successfully stored preferences'});
    });

    console.log(user);
    
  });
};


exports.stats = function(req, res) {
  var id = req.body.userId;
  User.findById({'_id': id}, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.send({view: 'home'});
      return;
    }
    if (user.people_met.length < 1) {
      res.send({message: 'Meet some folks'});
      return;
    }
    var stats = {};
    stats.people_met = JSON.parse(JSON.stringify(user.people_met)); // stringify and parse because our model doesn't like being modified
    stats.total_likes = user.total_likes;
    // find the users you've met and grab facebook photos
    // attach photos to people_met array on stats object
    var iMetThem = stats.people_met.map(function(elem, i) {
      var query = User.findOne({'_id': elem.user_id});
      return query.exec().then(function(user) {
        elem.picture = user.picture;
      }); 
    });
    Q.all(iMetThem).then(function(users){
      res.send(stats);  
    });
    
  });
};

exports.showPrevPreferences = function(req, res) {
  var id =  req.body.id;

  User.findById({'_id': id}, function(err, user) {
    if (err) throw err;
    if (!user) {
      res.send({view: 'home'}); 
      return;
    }
    res.send({preferences: user.preferences, age: user.age, distance: user.distance, gender: user.gender});
  });
};






