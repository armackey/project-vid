var User = require('../../../model');

module.exports = {

  setPreferences: function(req, res) {
    var id = req.body.id;
    console.log(req.body);
    var preferences = req.body.preferences || req.body;
    var distance = preferences.distance;
    var gtAge;
    var ltAge;

    if (preferences.maxAge < preferences.minAge) {
      gtAge = preferences.maxAge;
      ltAge = preferences.minAge;
    } else {
      gtAge = preferences.minAge;
      ltAge = preferences.maxAge;
    }

    User.findOne({'_id': id}, function(err, user) {
      if (!user) {
        res.send({view: 'home'}); 
        return;
      }

      user.preferences = {
        iWantToMeet: preferences.iWantToMeet, // gender user wants to meet
        age: {
          lt: ltAge,
          gt: gtAge
        }
      };

      user.distance = distance;

      user.save(function(err) {
        if (err) 
          throw err;
        if (user.people_met.length < 1) {
          res.send({view: 'video-chat', message: 'Successfully stored preferences'});
        } else {
          res.send({message: 'Successfully stored preferences'});  
        }      
      });
    });
  },

  getPreferences: function(req, res) {
    var id =  req.body.id;
    console.log(req.body);
    User.findById({'_id': id}, function(err, user) {
      if (err) throw err;
      if (!user) {
        res.send({view: 'home'}); 
        return;
      }
      res.send({preferences: user.preferences, birthday: user.birthday, age: user.age, distance: user.distance, gender: user.gender, orientation: user.orientation});
    });
  },


  getStats: function(req, res) {
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
  },

  getSelectionList: function(req, res) {
    var selected = req.body.selected.toLowerCase();
    var id = req.body.id;
    var list = [{gender: ["male", "female"], orientation: ["straight", "gay", "bi sexual"], status: ["single", "seeing someone", "married", "open relationship"]}];

    User.findById({'_id': id}, function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        res.send("new user send to login");
      }

      var prevSelectedValue = function() {
        for (var key in user) {
          if (key === selected) {
            return user[key];
          }
        }
      }();
      
      var x = list.map(function(arg, i) {
        return arg[selected];
      });

      console.log(x);

      res.send({list: x, prevSelectedValue: prevSelectedValue});

    });
  },

  updateSelection: function(req, res) {
    var selected = req.body.selected.toLowerCase();
    var id = req.body.id;
    var updateDetail = req.body.updateDetail.toLowerCase();
    
    User.findById({'_id': id}, function(err, user) {
      if (err) {
        throw err;
      }
      if (!user) {
        return res.send("new user send to login");
      }

      for (var key in user) {
        if (key === updateDetail) {
          user[key] = selected;
          user.save(function(err) {
            if (err)
              throw err;
            else
              return res.send({successful: "updated " + updateDetail, update: selected});
          });
        }
      }
    });
  }, 

  submitBirthday: function(req, res) {
    console.log('submitBirthday is being used');
    var id = req.body.userId;
    var birthday = req.body.birthday;

    console.log(req.body);

    User.findById({'_id': id}, function(err, user) {
      if (!user) res.send({view: 'login'});
      user.birthday = birthday;
      user.save(function(err) {
        if (err) throw err;
        res.send({message: "successfully saved"});
      });
    });
  }

};