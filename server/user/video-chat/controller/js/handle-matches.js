var User = require('../../../model');
var Call = require('../../../../Events/call.events');
var EE = require('events').EventEmitter;
var emitter = new EE();
var Q = require('q');
var Room = require('./handle-room-store');

require('dotenv').load();

module.exports = {

  getToken: function(req, res) {
    var id = req.body.userId;
    console.log(id);
    User.findOne({'_id': id}, function(err, user) {
      
      if (err) throw err;
      if (!user) return;
      
      var identity = user.id;
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
      res.send({
        identity: identity,
        token: token.toJwt(),
        name: user.firstName,
        likes: user.total_likes
      });
    });
  },
  getMatchInfo: function(req, res) {
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
  },
  searchForMatch: function(req, res) {
    var token = req.body.token;
    var id = req.body.userId;

    findMatches(id, req, res);
  },

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

    var distance = req.body.distance ? req.body.distance : user.distance;
    var call = new Call(id, emitter);
    var callList = call.getCallList(id); // returns a list of users that matches my preferences and within maxDistance
    var callListAmount = call.getCallList(id).length;
    
    checkIfStillAvail(call, id);
    

    User.find() //({'isOnline': true}) 
      .where({'_id': {$ne: id}})
      // .where('inCall').equals(false)
      // .where('inMatching').equals(true)
      // .where('location').near({ center: {type: 'Point', coordinates: [user.location.coordinates[0], user.location.coordinates[1]]}, 
      //   maxDistance: distance * 1609.34, spherical: true
      // })
      // .where('gender').equals(user.preferences.iWantToMeet)
      // .where({'age': {$ne: null, $gte: user.preferences.age.gt, $lte: user.preferences.age.lt}})
      // .limit(5)
      .exec(handleMatchedUsers).then(function() {
        console.log('exec');
      });

      function handleMatchedUsers(err, retrieved) {
        
        if (err) throw err;


        if (callListAmount > 4) {
          return;
        }

        retrieved.filter(function(otherUsers) {
          return otherUsers;          
          // return user.age <= otherUsers.preferences.age.lt &&
          //        user.age >= otherUsers.preferences.age.gt &&
          //        user.gender === otherUsers.preferences.iWantToMeet;
        })
        .forEach(function(matchedUser) {
          call.addUserToList(user._id, matchedUser.name, matchedUser._id, matchedUser.email);
        });

        var currentMatch = callList[0];

        if (callList.length < 1) {
          res.send({message: 'Searching for matches..', isListeningForCalls: true});
          return;
        }

        var room = new Room(createPrivateRoom(user.email, currentMatch.email), [{id: user._id, name: user.firstName}, {id: currentMatch.user_id, name: currentMatch.firstName}]);

        // toggleInCall([currentMatch.user_id, user._id]); needs to happen else where

        if (!res) return;

        res.send({
          socketid: user.socketid,
          room: room,
          matchedName: currentMatch.firstName,
          matchedId: currentMatch.user_id,
          isListeningForCalls: false,
          matchedSocketId: currentMatch.socketid
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

function createPrivateRoom(caller, answer) {
  return caller+answer;
}
