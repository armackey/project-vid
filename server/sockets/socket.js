var msgCtrl = require('../controllers/message.ctrl');
var userCtrl = require('../controllers/user.ctrl');

module.exports = function(io) {
  io.on('connection', function(socket) {
    
    var socketidArray = [];
    socketidArray.push(socket.id);

    socket.emit('greeting-from-server', {
      greeting: 'Hello Client'
    });

    socket.on('greeting-from-client', function (msg) {
      console.log(msg);
    });

    socket.on('new-message', function(msg) {
      msgCtrl.newMsg(msg).then(function() {
        io.in(msg.room).emit('message created');
      });
    });

    socket.on('new-user', function(data) {
      // data.room = defaultRoom;
      //New user joins the default room
      socket.join(data.room);
      //Tell all those in the room that a new user joined
      io.in(data.room).emit('user joined', data);
    });

    socket.on('switch-room', function(data) {
      //Handles joining and leaving rooms
      //console.log(data);
      socket.leave(data.oldRoom);
      socket.join(data.newRoom);
      io.in(data.oldRoom).emit('user left', data);
      io.in(data.newRoom).emit('user joined', data);

    });

    socket.on('disconnect', function(token) {
      console.log(socket.id  + ' has left');
      userCtrl.setOffline(socketidArray);
    });

    socket.on('connected', function(token) {
      console.log(socket.id  + ' has entered');
      userCtrl.isOnline(token, socket.id);
      console.log('The socket connected');
    });
  });


  
};
