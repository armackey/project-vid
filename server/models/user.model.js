var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  facebookID: String,
  token: String,
  socketid: String,
  name: String,
  picture: String,
  isOnline: {type: Boolean, default: false},
  email: String,
  inCall: {type: Boolean, default: false},
  gender: String,
  age: {type: Number},
  available: {type: Boolean, default: false},
  userTaken: {type: Boolean, default: false},
  location: {type: [Number]},
  created_at: {type: Date, default: Date.now},
  block_list: [
    {
      name: String
    },
    {
      user_id: String
    },
    {
      created_at: {type: Date, default: Date.now}
    }
  ],
  people_met: [
    {
      name: String
    },
    {
      user_id: String
    },
    {
      liked: {type: Boolean, default: false}
    },
    {
      mutual: {type: Boolean, default: false}
    },
    {
      games_played: {
        losses: {type: Number, default: 0},
        wins: {type: Number, default: 0}
      }
    },
    {
      created_at: {type: Date, default: Date.now}
    }
  ],

  total_likes: {type: Number, default: 0},

  
  message: {type: Schema.Types.ObjectId, ref: 'Message'},

  
  preferences: {
    iWantToMeet: String,
    age: {
      lt: Number,
      gt: Number
    }
  }
});

UserSchema.index({location: '2dsphere'});

module.exports = mongoose.model('User', UserSchema);


/*
  use navigator in browser to grab users lat & lon
  store in db after user logs in
*/