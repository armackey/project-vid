var msgCtrl = require('../controllers/message.ctrl');
var userCtrl = require('../controllers/user.ctrl');

module.exports = function(io) {

  io.on('connection', function(socket) {

    socket.on('disconnect', function(token) {
      console.log(socket.id  + ' has left');
      userCtrl.setOffline(socket.id);
    });

    socket.on('connected', function(token) {
      console.log(socket.id  + ' has entered');
      userCtrl.isOnline(token, socket.id);
    });
  });


  
};
