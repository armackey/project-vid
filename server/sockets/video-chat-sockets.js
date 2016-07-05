var userCtrl = require('../controllers/user.ctrl');
var videoCtrl = require('../controllers/video.ctrl');

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
      console.log(data.room);
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
      userCtrl.itsMutual(data.room, data.photo, data.name, data.id);
      io.in(data.room).emit('notify-its-mutual', data);
    });

    socket.on('video-call-response', function(data) {

      videoCtrl.removePendingCaller(data.receiver.id, data.caller.id);

      if (data.answered) {

        videoCtrl.findSocketId([data.receiver.id, data.caller.id]).then(function(users) {
          videoCtrl.addCallerToUpcomingCalls(data.receiver, data.caller);
          users.forEach(function(elems, i) {
            // io.in(elems.socketid).emit('start-video', users);
          });
        });

      }
    });

    socket.on('request-call-invite', function(data) {
      videoCtrl.findSocketId([data.receiver.id]).then(function(receiver) {
        videoCtrl.callPending(data.receiver, data.caller);
        io.in(receiver[0].socketid).emit('receive-video-invite', data);
      });
    });

    socket.on('random-video-invite', function(data) {
      videoCtrl.findSocketId([data.receiverId]).then(function(receiver) {
        io.in(receiver[0].socketid).emit('receive-random-video-invite', data);
      });
    });


  });
};