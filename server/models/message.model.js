var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  content: String,
  name: String,
  room: String,
  created_at: {type: Date, default: Date.now},
  msg_created: {type: Date, default: Date.now},
  subscriber: {type: Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Message', MessageSchema);


/*
  use navigator in browser to grab users lat & lon
  store in db after user logs in
*/