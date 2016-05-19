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
        handleResponse('yes');
        chatSocket.emit('response-add-time', response);  
      };
      
      self.negResponse = function() {
        handleResponse('no');
        chatSocket.emit('response-add-time', response);  
      };

      function handleResponse(text) {
        response.answer = text;
      }

      chatSocket.on('received-response', function(data) {
        if (data.answer === 'yes') {
          $rootScope.$broadcast('emit-timer');
        } else {
          console.log('sorry');
        }
        conToVidChat.madeRequest = false;
        $fancyModal.close();
      }); 

    }


})();