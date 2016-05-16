(function() {

  angular
    .module('app')
    .controller('videoChatCtrl', videoChatCtrl);  
    // $inject allows us to properly inject modules in our case the $scope object
    videoChatCtrl.$inject = ['$interval', '$http', '$timeout', 'chatSocket', 'authFact', 'conToVidChat', '$scope', '$fancyModal', '$rootScope'];

    function videoChatCtrl($interval, $http, $timeout, chatSocket, authFact, conToVidChat, $scope, $fancyModal, $rootScope) {

      var self = this;

      
      var conversationsClient;
      var activeConversation;
      var previewMedia;
      var identity;
      var room;

      self.match = {
        name: conToVidChat.getMatchName() ? conToVidChat.getMatchName() : null,
        id: null,
      };

      $rootScope.$on('emit-timer', function(data) {
        self.match.name = conToVidChat.getMatchName(); // for the user being found or called
      });

      var token = authFact.getTokenLocalStorage();

      self.currentUser = authFact.getUser();
      conToVidChat.connectToSocket();

      // Check for WebRTC
      if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
        alert('WebRTC is not available in your browser.');
      }

      $http.put('/twilioToken', token).then(function(user) {
        identity = user.data.identity;
        var accessManager = new Twilio.AccessManager(user.data.token);

        // Check the browser console to see your generated identity. 
        // Send an invite to yourself if you want! 

        // Create a Conversations Client and connect to Twilio
        conversationsClient = new Twilio.Conversations.Client(accessManager);
        conversationsClient.listen().then(clientConnected, function (error) {
          log('Could not connect to Twilio: ' + error.message);
        });
      });

      function clientConnected() {
        conToVidChat.searchForMatch().then(function(data) {
          conToVidChat.setSocketId(data);
          console.log(data);
          if (!data.message) {
            self.match.id = data.id;
            self.match.name = data.name;
            conToVidChat.setMatchName(data.name);
            conToVidChat.setRoom(data.room);
            conToVidChat.setMatchId(data.id);
          } else {
            self.match.id = null;
          }

      }).then(function() {

          conversationsClient.on('invite', function(invite) {

            invite.accept().then(conversationStarted);
            var id = invite;
            conToVidChat.receiveMatch(id);
            conToVidChat.setMatchId(id);

          });
          
          if (activeConversation) {
            activeConversation.invite(self.match.id);
          } else {
            // Create a conversation
            var options = {};
            if (previewMedia) {
              options.localMedia = previewMedia;
            }

            conversationsClient.inviteToConversation(self.match.id, options).then(conversationStarted, function(error) {

              log('Unable to create conversation');
              console.error('Unable to create conversation', error);
              // return clientConnected();
            });
        }});
      }

      // Conversation is live
      function conversationStarted(conversation) {
        log('In an active Conversation');
        activeConversation = conversation;
        // Draw local video, if not already previewing
        if (!previewMedia) {
          conversation.localMedia.attach('#local-media');
        }

        // When a participant joins, draw their video on screen
        conversation.on('participantConnected', function(participant) {
          
          conToVidChat.enterRoom();  // *********** user joining socket room

          // log("Participant '" + participant.identity + "' connected");
          participant.media.attach('#remote-media');
          
          conToVidChat.inCall = true;

          chatSocket.on('start-timer', function(data) { // socket should start timer
            $scope.$emit('emit-timer', data); 
          }); 
        });

        // When a participant disconnects, note in log
        conversation.on('participantDisconnected', function(participant) {
          conToVidChat.inCall = false;
          log("Participant '" + participant.identity + "' disconnected");
        });

        // When the conversation ends, stop capturing local video
        conversation.on('ended', function(conversation) {
          log("Connected to Twilio. Listening for incoming Invites as '" + conversationsClient.identity + "'");
          conversation.localMedia.stop();
          conversation.disconnect();
          activeConversation = null;
        });
      }

      //  Local video preview
        // if (!previewMedia) {
        //   previewMedia = new Twilio.Conversations.LocalMedia();
        //   Twilio.Conversations.getUserMedia().then(
        //   function (mediaStream) {
        //     previewMedia.addStream(mediaStream);
        //     previewMedia.attach('#local-media');
        //   },
        //   function (error) {
        //     console.error('Unable to access local media', error);
        //     log('Unable to access Camera and Microphone');
        //   });
        // }

        function log(arg) {
          console.log(arg);
        }

  }
})();




