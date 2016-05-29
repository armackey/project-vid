var userCtrl = require('../controllers/user.ctrl');

module.exports = function(io) {
  io.on('connection', function(socket) {
    socket.on('enter-room', function(room) {
      var clientsInRoom = io.sockets.adapter.rooms[room];
      socket.join(room);
      
      if (!clientsInRoom)  {
        return;
      }

      if (clientsInRoom.length === 2) {
        io.in(room).emit('users-connected'); // starts timer for both clients      
      }

    });

    socket.on('request-add-time', function(data) {
      // tell other user that time wants to be added
      io.in(data.room).emit('sent-request', data);
    });

    socket.on('response-add-time', function(data) {
      // tell other user the response
      console.log(data);
      io.in(data.room).emit('received-response', data);
    });

    socket.on('leaving-chat', function(data) {
      console.log(data);
      io.in(data.room).emit('peer-left-chat', data);
    });

    socket.on('like-sent', function(data) {
      userCtrl.tallyLikes(data.matchId); // add a like to the matched user 
      io.in(data.room).emit('notify-liked', data); 
    });



    socket.on('mutual-like', function(data) {
      console.log('its mutual');
      userCtrl.itsMutual(data);
      // in mutual-like, write a function that will find users in room from db
      // create chat from there
      io.in(data.room).emit('notify-its-mutual', data);
    });



  });
};