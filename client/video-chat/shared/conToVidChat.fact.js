(function() {
  'use strict';

  angular
    .module('app')
    .factory('conToVidChat', conToVidChat);

    conToVidChat.$inject = ['$http', 'chatSocket', 'authFact', '$q', '$rootScope', '$fancyModal'];

    function conToVidChat($http, chatSocket, authFact, $q, $rootScope, $fancyModal) {

      var room, selectedUser, socketid, matchName, matchId, totalLikes,
      token = authFact.getTokenLocalStorage(),
      deferred = $q.defer();

      $rootScope.$on('users-connected', function() {
        $rootScope.$broadcast('chat-starts'); 
      }); 

      chatSocket.on('sent-request', function(data) { 
        $fancyModal.open({
          templateUrl: './video-chat/add-time-modal/add-time-modal.html',
          showCloseButton: false,
          closeOnOverlayClick: false,
        });
      });

      return {
        
        sentLike: false, 
        madeRequest: false, // if made request to add time you'll see a different modal
        inCall: false,

        searchForMatch: function() {
          $http.put('/searchForMatch', token).then(function(user) {
            deferred.resolve(user.data);
          }, function(user) {
            deferred.reject(user);
          });
          return deferred.promise;
        },

        receiveMatch: function(id) { // user whos waiting to be matched.. didn't find a match at first
          $http.put('/receiveMatch', id).then(function(user) {
            console.log(user);
            matchName = user.data.name;
            room = user.data.room; 
          });
        },

        setSocketId: function(socket) {
          socketid = socket.socketid;
        },

        getSocketId: function() {
          return socketid;
        },

        setRoom: function(myRoom) {
          room = myRoom;
        },

        getRoom: function() {
          return room;
        },

        requestAddTime: function(data) {
          data.room = room;
          this.madeRequest = true;
          chatSocket.emit('request-add-time', data);
        },

        setMatchId: function(myMatch) {
          matchId = myMatch;
        },

        getMatchId: function() {
          return matchId;
        },

        setMatchName: function(name) {
          matchName = name;
        },

        getMatchName: function() {
          return matchName;
        },

        enterRoom: function() {
          chatSocket.emit('enter-room', room);
        },

        connectToSocket: function() {
          chatSocket.emit('connected', authFact.getTokenLocalStorage().token);
        },

        setLikes: function(likes) {
          totalLikes = likes;
        },

        getLikes: function() {
          return totalLikes;
        }

      };

    }

})();