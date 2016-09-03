var videoChatCtrl = require('../controller');

module.exports = function(io) {
  io.on('connection', function(socket) {
    socket.on('enter-room', function(data) {
      var clientsInRoom = io.sockets.adapter.rooms[data.room];
      socket.join(data.room);
      // console.log(clientsInRoom);
      videoChatCtrl.toggleInCall(data.id, data.inCall);
      if (!clientsInRoom)  {
        return;
      }

      if (clientsInRoom.length === 2) {
        io.in(data.room).emit('users-connected'); // starts timer for both clients   
      }

    });

    socket.on('exit-call', function(data) {
      videoChatCtrl.toggleInCall(data.id, data.inCall);
    });

    socket.on('request-add-time', function(data) {
      // tell other user that time wants to be added
      console.log(data);
      io.in(data.room).emit('sent-request', data);
      socket.emit('sent-request', data);
    });

    socket.on('response-add-time', function(data) {
      // tell other user the response
      io.in(data.room).emit('received-response', data);
    });

    socket.on('decline-add-time', function(data) {
      io.in(data.room).emit('received-response', data);
    });

    socket.on('leaving-chat', function(data) {
      console.log(data);
      io.in(data.room).emit('peer-left-chat', data);
    });

    socket.on('like-sent', function(data) {
      videoChatCtrl.tallyLikes(data.matchId); // add a like to the matched user 
      io.in(data.room).emit('notify-liked', data); 
    });

    socket.on('mutual-like', function(data) {
      console.log('its mutual');
      videoChatCtrl.itsMutual(data.room, data.photo, data.name, data.id);
      io.in(data.room).emit('notify-its-mutual', data);
    });

    socket.on('video-call-response', function(data) {

      videoChatCtrl.removePendingCaller(data.receiver.id, data.caller.id);

      if (data.answered) {
        videoChatCtrl.findSocketId([data.receiver.id, data.caller.id]).then(function(users) {
          videoChatCtrl.addCallerToUpcomingCalls(data.receiver, data.caller);
          users.forEach(function(elems, i) {
            // io.in(elems.socketid).emit('start-video', users);
          });
        });
      }
    });

    socket.on('request-call-invite', function(data) {
      videoChatCtrl.findSocketId([data.receiver.id]).then(function(receiver) {
        videoChatCtrl.callPending(data.receiver, data.caller);
        io.in(receiver[0].socketid).emit('receive-video-invite', data);
      });
    });

    socket.on('random-video-invite', function(data) {
      videoChatCtrl.findSocketId([data.receiverId]).then(function(receiver) {
        io.in(receiver[0].socketid).emit('receive-random-video-invite', data);
      });
    });

  });
};