(function() {

  angular
    .module('app')
    .controller('confirmTimeCtrl', confirmTimeCtrl);

    confirmTimeCtrl.$inject = ['conToVidChat', 'chatSocket', '$fancyModal', '$rootScope'];

    function confirmTimeCtrl(conToVidChat, chatSocket, $fancyModal, $rootScope) {

      var self = this;
      var room = conToVidChat.getRoom();
      var response = {
        room: room
      };

      self.madeRequest = conToVidChat.madeRequest;

      self.matchedName = conToVidChat.getMatchName() ? conToVidChat.getMatchName() : null;

      self.posResponse = function() {
        console.log('yes');
        response.answer = 'yes';
        chatSocket.emit('response-add-time', response);  
      };
      
      self.negResponse = function() {
        response.answer = 'no';
        chatSocket.emit('response-add-time', response);  
      };

      chatSocket.on('received-response', function(data) {
        if (data.answer === 'yes') {
          $rootScope.$emit('emit-timer', data);
        } else {
          console.log('sorry');
        }
        conToVidChat.madeRequest = false;
        $fancyModal.close();
      }); 

    }


})();