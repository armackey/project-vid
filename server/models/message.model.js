var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var MessageSchema = new Schema({
  content: [{
    from: String,  
    message: String,
    created_at: {type: Date, default: Date.now}
  }],
  created_at: {type: Date, default: Date.now},
  created_by: [{type: Schema.Types.ObjectId, ref: 'User'}]
});

module.exports = mongoose.model('Message', MessageSchema);


/*
  use navigator in browser to grab users lat & lon
  store in db after user logs in
*/