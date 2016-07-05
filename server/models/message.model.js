var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  content: {
    users:[{
      userId: String,
      photo: String
    }],
    messages: [{
      from: String,
      message: String,
      unread: {type: Boolean, default: true},
      created_at: {type: Date, default: Date.now},
      pending_call: {type: Boolean, default: false},
      expired: {type: Boolean, default: false},
      denied: {type: Boolean, default: false},
      answered: {type: Boolean, default: false},
      video_request: {type: Boolean, default: false},
      user_id: String
    }]
  },
  created_at: {type: Date, default: Date.now},
  last_message_date: {type: Date, default: Date.now},
  created_by: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Message', MessageSchema);


/*
  use navigator in browser to grab users lat & lon
  store in db after user logs in
*/