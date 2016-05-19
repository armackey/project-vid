(function() {
  'use strict';

  angular
    .module('app')
    .controller('messageCtrl', messageCtrl);

    messageCtrl.$inject = ['$http', '$timeout', '$interval', 'chatSocket', 'authFact'];
    
    function messageCtrl($http, $timeout, $interval, chatSocket, authFact) {

      chatSocket.on('greeting-from-server', function(data) {
        console.log(data);
      }); 

      // chatSocket.emit('greeting-from-client', 'wow'); 

      // chatSocket.emit('connected', 'user says hi');

    }

})();