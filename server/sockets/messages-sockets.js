var msgCtrl = require('../controllers/message.ctrl');
var videoCtrl = require('../controllers/video.ctrl');

module.exports = function(io) {
  io.on('connection', function(socket) {

    socket.on('send-message', function(data) {
      msgCtrl.saveMsg(data).then(function(users) {
        for (var i = 0; i < users.length; i++) {
          io.to(users[i].socketid).emit('message-receive', data);
        }
      });
    });

    socket.on('video-call-response', function(data) {
      console.log(data);
      videoCtrl.findSocketId([data.receiver.id, data.caller.id]).then(function(users) {
        users.forEach(function(elem) {
          io.in(elem.socketid).emit('accept-decline-response-message', {answer: data.answer, messageId: data.messageId});
        });
        msgCtrl.togglePendingAndDenied(data.answered, data.threadId, data.messageId);
      });
    });

  });
};