var path = require('path');
var express = require('express');
var passport = require('passport');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var User = require('./models/user.model');
var app = express();
var session = require('express-session');
var http = require('http').Server(app);
var io = require('socket.io')(http);

mongoose.connect('mongodb://localhost/video-match', function(err){
  if (err) {
    console.log('turn on mongo') ;
    return err;
  }
  console.log('connected to DB');
  User.find({}, function (err, users) {
    users.filter(function(ele, i, array) {
      return ele.userTaken === true;
    }).map(function(ele, i, array) {
      ele.userTaken = false;
      ele.save();
      console.log('users have been reset');
    });
  });
});


// Create Express webapp

app.use(express.static('client'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  secret: 'sssshhhh',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());


require('./routes/fb.routes')(app, passport);
require('./config/passport')(passport);
require('./sockets/socket')(io);
require('./sockets/video-chat-sockets')(io);

app.use(require('./routes/user.routes'));



// Create http server and run it
var port = process.env.PORT || 3000;

http.listen(port, function() {
  console.log('Express server running on *********:' + port);
});

