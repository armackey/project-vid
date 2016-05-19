var User = require('../models/user.model');
var AccessToken = require('twilio').AccessToken;
var ConversationsGrant = AccessToken.ConversationsGrant;
require('dotenv').load();


exports.setOffline = function(socketid) {
  User.find({'socketid': socketid}, function(err, user) {
    if (err) throw err;
    if (!user) return;
    if (user.length < 1) return;

    user[0].socketid = '';
    user[0].room = '';
    user[0].inCall = false;
    user[0].isOnline = false;
    user[0].save(function(err) {
      if (err) throw err;
    });
  });
};

exports.likedMatch = function(userid) {
  User.findOne({'_id': userid}, function(err, user) {
    if (err) throw err;
    if (!user) return;
    user.likes+=1;
    user.save(function(err) {
      if (err) throw err;
    });
  });
};

exports.itsMutual = function(room) {
  console.log(room);
  User.find({'room': room}, function(err, users) {
    console.log(users);
  });
};

exports.inCall = function(socketid) {
  // build toggle for setting someone in a call
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

exports.receiveMatch = function(req, res) {
  var id = req.body.from;
  User.findOne({'_id': id}, function(err, user) {
    if (err) throw err;
    res.send({
      room: user.room,
      name: user.name
    });
  });
};

/*
Load Twilio configuration from .env config file - the following environment
variables should be set:
process.env.TWILIO_ACCOUNT_SID
process.env.TWILIO_API_KEY
process.env.TWILIO_API_SECRET
process.env.TWILIO_CONFIGURATION_SID

Generate an Access Token for a chat application user - it generates a random
username for the client requesting a token, and takes a device ID as a query
parameter.
*/
exports.getToken = function(req, res) {
  var myToken = req.body.token;
  // if (!auth(myToken)) 
  //   return;
  User.findOne({'token': myToken}, function(err, user) {

    var identity = user.id;
    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    var token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET
    );
    
    token.identity = identity;
    console.log('i am ' + token.identity);
    
    // Assign the generated identity to the token
    //grant the access token Twilio Video capabilities
    var grant = new ConversationsGrant();
    grant.configurationProfileSid = process.env.TWILIO_CONFIGURATION_SID;
    token.addGrant(grant);
    // Serialize the token to a JWT string and include it in a JSON response
    res.send({
      identity: identity,
      token: token.toJwt(),
      name: user.name
    });

  });
};  



exports.login = function(req, res) {
  User.findOne({'facebookID' : req.body.id}, function(err, user) {
    
    if (err) throw err;

    if (user) {

      user.token = req.body.token;
      user.name  = req.body.name;
      user.save(function(err) {
        if (err) throw err;
      });

      if (!user.preferences.age.lt || !user.preferences.age.gt || !user.preferences.iWantToMeet) {
        res.send({
          view: 'settings', 
          message: 'missing preferences'
        }); 
        return;       
      }
      // may need to add return and save here as well ***IF*** decided to send info for new users

      res.send({
        view: 'video-chat',
        message: 'welcome back'
      });

      return;

    } else {

      var newUser = new User();

      newUser.facebookID = req.body.id; 
      newUser.gender = req.body.gender;
      newUser.token = req.body.token; 
      newUser.name  = req.body.name;
      newUser.email = req.body.email;

      newUser.save(function(err) {
        if (err) throw err;
      });
    }
  

    res.send({
      view: 'settings', 
      message: 'missing preferences'
    }); 
  });
};


// TODO: ADD LOCATION TO QUERY............!!!!!!!!!!!!!!
exports.searchForMatch = function(req, res) {
  var token = req.body.token;
  // if (!auth(token)) 
  //   return;
  User.findOne({'token': token}, function(err, user) {
    // if (user.inCall) {
    //   console.log('call being answered');
    //   User.findOne({'room': user.room})
    //     .where({'token': {$ne: token}})
    //     .exec(function(err, retrieved) {
          
    //       res.send({
    //         typeUser: 'i am aswering',
    //         name: user.name,
    //         // remoteSocketid: user.socketid,
    //         room: user.room,
    //         id: user._id
    //       });
    //     });
    //   return;
    // }

    User.find({'isOnline': true})
      .where({'token': {$ne: token}})
      .where('inCall').equals(false)
      .where('gender').equals(user.preferences.iWantToMeet)
      .where('age').gte(user.preferences.age.gt).lte(user.preferences.age.lt)
      .exec(doWeMatch);

      function doWeMatch(err, retrieved) {
        if (err) throw err;
        if (retrieved.length < 1) {
          res.send({message: 'sorry no users at this time', socketid: user.socketid}); return; // if we can't find any matches, it needs to search again.... expand search criteria
        }
        
        var matches = retrieved.filter(function(records) {
          return user.age <= records.preferences.age.lt &&
                 user.age >= records.preferences.age.gt &&
                 user.gender === records.preferences.iWantToMeet;
        });
        // randomly select one user to send back to client
        // write function to hash both emails
        // pass result to socket io to create private room
        
        var randomNum = Math.floor((Math.random() * 10) + 1);        

        // TODO:***************************************************************************
        // change matches matches[0] to matches[randomNum] when there's more users
        // actually hash the email addresses you lazy bum!!!
        var selectedUser = matches[0];

        var callerEmail = user.email; // callerEmail prevents users email from being modified
        var room = createPrivateRoom(user, matches[0]);
        

        function storeRoom(room) {
          user.room = room;
          user.email = callerEmail;
          user.inCall = true;
          selectedUser.room = room; // answering user gets the same room... duh..
          selectedUser.inCall = true;

          selectedUser.save(function(err) {
            if (err) throw err;
          });
          user.save(function(err) {
            if (err) throw err;
          });
        }

        storeRoom(room);

        var sayHi = {
          typeUser: 'i am calling',
          socketid: user.socketid,
          room: room,
          name: selectedUser.name,
          id: selectedUser._id
        };

        res.send(sayHi);  // sends the calling user information

      }
  });
};  


function createPrivateRoom(caller, answer) {
  return caller.email+=answer.email;
}




exports.preferences = function(req, res) {
  var token = req.body.token;
  // if (!auth(token)) 
  //   return;
  var pref = req.body.preferences;
  var gender = req.body.gender;
  var age = req.body.myAge;

  

  User.findOne({'token': token}, function(err, user) {

    user.preferences = {
      iWantToMeet: pref.iWantToMeet,
      age: {
        lt: pref.ltAge.age,
        gt: pref.gtAge.age
      }
    };
    
    user.gender = gender;
    user.age = age.age;

    user.save(function(err) {
      if (err) 
        throw err;
    });
    res.send({message: 'thank you!'});
  });
};

function auth(token) {
  User.findOne({'token': token}, function(err, user) {
    if (user) 
      return true;
    else
      return false;
  });
}





