(function() {
  'use strict';
  
  angular
    .module('app')
    .factory('conToVidChat', conToVidChat);

    conToVidChat.$inject = ['$http', 'chatSocket', 'authFact', '$q', '$rootScope', '$fancyModal'];

    function conToVidChat($http, chatSocket, authFact, $q, $rootScope, $fancyModal) {

      var room, 
      selectedUser, 
      socketid,
      matchName,
      matchId,
      time = 0,
      token = authFact.getTokenLocalStorage(),
      deferred = $q.defer();

      $rootScope.$on('emit-timer', function(event, data) {
        $rootScope.$broadcast('timeAdded', 'data');
      }); 

      chatSocket.on('sent-request', function(data) { 
        $fancyModal.open({templateUrl: './video-chat/add-time-modal/add-time-modal.html'});
      });

      return {
        sentLike: false, 
        madeRequest: false, // if made request to add time you'll see a different modal
        inCall: false,
        searchForMatch: function() {
          if (this.inCall) 
            return;
          $http.put('/searchForMatch', token).then(function(user) {
            deferred.resolve(user.data);
          }, function(user) {
            deferred.reject(user);
          });
          return deferred.promise;
        },
        receiveMatch: function(id) { // user whos waiting to be matched.. didn't find a match at first
          $http.put('/receiveMatch', id).then(function(user) {
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
          chatSocket.emit('connected', token.token);
        },
        setTime: function(arg) {
          time = arg;
        },
        getTime: function() {
          return time;
        }
      };

    }

})();