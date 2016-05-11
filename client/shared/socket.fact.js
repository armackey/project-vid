(function(){
  'use strict';

  angular
    .module('app')
    .factory('chatSocket', chatSocket);

    chatSocket.$inject = ['socketFactory'];

    function chatSocket(socketFactory) {
      return socketFactory();
    }

})();