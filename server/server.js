var path = require('path');
var express = require('express');
// var passport = require('passport');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
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
});


app.use(express.static('client'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(session({
  secret: 'sssshhhh',
  resave: true,
  saveUninitialized: true
}));
// app.use(passport.initialize());
// app.use(passport.session());


// require('./routes/fb.routes')(app, passport);
// require('./config/passport')(passport);
require('./sockets/socket')(io);
require('./sockets/video-chat-sockets')(io);
require('./sockets/messages-sockets')(io);

app.use(require('./routes/user.routes'));
app.use(require('./routes/message.routes'));
app.use(require('./routes/video.routes'));

// app.use(function (req, res, next) {
//   // Website you wish to allow to connect
//   res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
//   // Request methods you wish to allow
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//   // Request headers you wish to allow
//   res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
//   // Set to true if you need the website to include cookies in the requests sent
//   // to the API (e.g. in case you use sessions)
//   res.setHeader('Access-Control-Allow-Credentials', true);
//   // Pass to next layer of middleware
//     next();
// });


// Create http server and run it
var port = process.env.PORT || 3000;

http.listen(port, function() {
  console.log('Express server running on *********:' + port);
});

