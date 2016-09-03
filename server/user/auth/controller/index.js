var User = require('../../model');

exports.login = function(req, res) {
  var facebookId = req.body.fbId;
  console.log(req.body);

  User.findOne({'facebookId': facebookId}, function(err, user) {

    if (user) {
      console.log('user exist');
      if (user.token !== req.body.token) {
        console.log('new token');console.log('new token');console.log('new token');console.log('new token');
      } 

      user.token = req.body.token;
      user.name  = req.body.name;
      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.picture = req.body.picture.data.url;
      // user.location.coordinates[0] = req.body.position.longitude;
      // user.location.coordinates[1] = req.body.position.latitude;
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
          preferences: user.preferences,
          location: user.location,
          picture: user.picture,
          token: user.token
        });

      }

    } else {

      var newUser = new User();

      newUser.facebookId = req.body.fbId; 
      newUser.gender = req.body.gender;
      newUser.token = req.body.token; 
      newUser.name  = req.body.name;
      newUser.email = req.body.email;
      newUser.firstName = req.body.firstName;
      newUser.lastName = req.body.lastName;

      // newUser.location.coordinates[0] = req.body.position.longitude;
      // newUser.location.coordinates[1] = req.body.position.latitude;
      newUser.picture = req.body.picture.data.url;

      newUser.save(function(err) {
        if (err) throw err;

        res.send({
          id: newUser._id,
          view: 'preferences', 
          message: 'new user',
          location: newUser.location,
          preferences: newUser.preferences,
          picture: newUser.picture
        }); 
      });
    }

  });
};