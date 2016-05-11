var userCtrl = require('../controllers/user.ctrl');

module.exports = function(io) {
  io.on('connection', function(socket) {
    var roomArray = [];
    socket.on('enter-room', function(room) {
      
      var clientsInRoom = io.sockets.adapter.rooms[room];
      socket.join(room);
      
      if (!clientsInRoom) 
        return;

      if (clientsInRoom.length === 2) {
        io.in(room).emit('start-timer', {time: 60}); // should start timer for both clients      
      }

      socket.on('update-timer', function(data) {

        // for (var i = 0; i < clientsInRoom.length; i+=1) {
        //   if (clientsInRoom[i] !== data.socketid) {
        //     io.in(room).emit('request-add-time', {message: '{user} would like to add time.'});    
        //   }
        // }
        
      });

      // io.in(room)
      
      
    });


    

    socket.on('request-add-time', function(data) {
      // tell other user that time wants to be added
    });

    socket.emit('response-add-time', function(data) {
      // tell other user that time wants to be added
    });      


  });
};