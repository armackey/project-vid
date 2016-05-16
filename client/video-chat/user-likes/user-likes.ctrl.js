(function() {
  'use strict';
  
  angular
    .module('app')
    .controller('userLikes', userLikes);

    userLikes.$inject = ['conToVidChat', 'chatSocket', '$fancyModal', '$rootScope'];

    function userLikes(conToVidChat, chatSocket, $fancyModal, $rootScope) {



    }


  })();