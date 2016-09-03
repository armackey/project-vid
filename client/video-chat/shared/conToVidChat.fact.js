(function() {
  'use strict';

  angular
    .module('app')
    .factory('conToVidChat', conToVidChat);

    conToVidChat.$inject = ['$http', 'chatSocket', 'authFact', '$q', '$rootScope', '$fancyModal'];

    function conToVidChat($http, chatSocket, authFact, $q, $rootScope, $fancyModal) {

      var room, selectedUser, socketid, matchName, matchId, totalLikes,
          storageInfo = authFact.getTokenLocalStorage(),
          deferred = $q.defer();


      chatSocket.on('sent-request', function(data) { 
        $fancyModal.open({
          templateUrl: './video-chat/add-time-modal/add-time-modal.html',
          showCloseButton: false,
          closeOnOverlayClick: false,
        });
      });

      return {
        
        isAvail: false,
        sentLike: false, 
        madeRequest: false, // if made request to add time you'll see a different modal
        inCall: false,

        searchForMatch: function() {
          $http.put('/searchForMatch', storageInfo).then(function(user) {
            deferred.resolve(user.data);
          }, function(user) {
            deferred.reject(user);
          });
          return deferred.promise;
        },

        getMatchInfo: function(id) { // user whos waiting to be matched.. didn't find a match at first
          $http.put('/getMatchInfo', id).then(function(user) {
            console.log(user);
            matchName = user.data.name;
            room = user.data.room; 
          });
        },

        justMet: function() {
          var otherUser = {};
          otherUser.myToken = storageInfo;
          otherUser.otherId = matchId;
          otherUser.name = matchName;
          console.log(otherUser);
          $http.post('/justMet', otherUser).then(function() {

          });
        },

        isAvailToChat: function(avail) {
          var self = this;
          $http.put('/availToChat', {token: storageInfo.token, avail: avail}).then(function(data) {
            self.isAvail = data.data.avail;
          });
        },

        inMatching: function(inMatch) {
          $http.put('/inMatching', {id: storageInfo.userId, inMatch: inMatch}).then(function(data) {});
        },

        getAvail: function() {
          return this.isAvail;
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

        enterRoom: function(inCall) {
          chatSocket.emit('enter-room', {room: room, id: storageInfo.userId, inCall: inCall});
        },

        exitCall: function(inCall) {
          chatSocket.emit('exit-call', {id: storageInfo.userId, inCall: inCall});
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