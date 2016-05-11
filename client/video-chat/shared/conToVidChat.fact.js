(function() {

  angular
    .module('app')
    .factory('conToVidChat', conToVidChat);

    conToVidChat.$inject = ['$http', 'chatSocket', 'authFact', '$q', '$rootScope'];

    function conToVidChat($http, chatSocket, authFact, $q, $rootScope) {

      var room, selectedUser, 
      time = 0,
      socketid,
      token = authFact.getTokenLocalStorage(),
      deferred = $q.defer(),
      self = this;

      $rootScope.$on('emitTimer', function(event, args) {
        console.log(args);
        $rootScope.$broadcast('timeAdded', {data: args});
      }); 

      chatSocket.on('request-add-time', function(data) {
        console.log(data);
      });

      return {

        currentTime: 0,
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
        receiveRoomId: function(id) {
          $http.put('/receiveRoomId', id).then(function(user) {
            room = user.data;  
          });
        },
        setSocketId: function(arg) {
          socketid = arg.socketid;
        },
        setRoom: function(arg) {
          room = arg;
        },
        setId: function(arg) {
          id = arg;
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
        },
        updateTimer: function(num) {
          chatSocket.emit('update-timer', num);
        },

        // broadcastTime: function() {
        //   $rootScope.$broadcast('timerBroadcast');
        // }
      };

    }

})();