var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  facebookID: String,
  token: String,
  socketid: String,
  room: String,
  name: String,
  isOnline: {type: Boolean, default: false},
  email: String,
  inCall: {type: Boolean, default: false},
  gender: String,
  age: {type: Number},
  isMatched: {type: Boolean, default: false},
  userTaken: {type: Boolean, default: false},
  location: {type: [Number]},
  created_at: {type: Date, default: Date.now},
  likes: {type: Number, default: 0},

  
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