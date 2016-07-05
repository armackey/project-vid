(function() {
  'use strict';
  
  angular
    .module('app')
    .controller('callUser', callUser);

    callUser.$inject = ['$http', 'chatSocket', 'conToVidChat', 'makeCall'];

    function callUser($http, chatSocket, conToVidChat, makeCall) {
      
    }

}());