var msgCtrl = require('../controllers/message.ctrl');

module.exports = function(io) {
  io.on('connection', function(socket) {

    socket.on('send-message', function(data) {
      msgCtrl.saveMsg(data).then(function(users) {
        for (var i = 0; i < users.length; i++) {
          io.to(users[i].socketid).emit('message-receive', data);
        }
      });
    });

  });
};