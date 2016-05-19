(function() {
  'use strict';

  angular
    .module('app')
    .controller('userLikes', userLikes);

    userLikes.$inject = ['conToVidChat', 'chatSocket', '$fancyModal', '$rootScope', 'authFact'];

    function userLikes(conToVidChat, chatSocket, $fancyModal, $rootScope, authFact) {

      var self = this;
      var sendLike;

      self.clickedLike = false;
      self.likeReceived = false;
      self.notifyLiked = '';

      // when chat starts we need the id and name of our matched user  
      $rootScope.$on('chat-starts', function(data) { 
        sendLike = {
         matchId: conToVidChat.getMatchId(), 
         matchedName: conToVidChat.getMatchName(),
         room: conToVidChat.getRoom()
        };
      });

      chatSocket.on('notify-liked', function(data) {
        // the other user sent the data obj with the persons name attached
        // if that name is the current user they need to know they have received a like
        if (data.matchedName === authFact.getUser()) {
          handleLikeNotification('like receieved.');
          self.likeReceived = true;
        } else {
          handleLikeNotification('like was sent');
        }
      });

      function handleLikeNotification(text) {
        self.notifyLiked = '';
        self.notifyLiked += text;
        if (self.likeReceived && self.clickedLike) {
          chatSocket.emit('mutual-like', conToVidChat.getRoom());
        }
      }

      self.iLikeYou = function() {
        self.clickedLike = true;
        chatSocket.emit('like-sent', sendLike); // tell server of our infactuation
      };



    }


  })();