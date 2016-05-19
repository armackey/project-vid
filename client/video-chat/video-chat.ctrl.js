(function() {
  'use strict';
  
  angular
    .module('app')
    .controller('videoChatCtrl', videoChatCtrl);  
    // $inject allows us to properly inject modules in our case the $scope object
    videoChatCtrl.$inject = ['$interval', '$http', 'chatSocket', 'authFact', 'conToVidChat', '$scope', '$fancyModal', '$rootScope'];

    function videoChatCtrl($interval, $http, chatSocket, authFact, conToVidChat, $scope, $fancyModal, $rootScope) {

      var self = this;

      var token = authFact.getTokenLocalStorage();
      var conversationsClient;
      var activeConversation;
      var previewMedia;
      var identity;
      var room;


      self.inCall = false;

      self.currentUser = authFact.getUser();
      self.match = {
        name: conToVidChat.getMatchName() ? conToVidChat.getMatchName() : null,
        id: null,
      };

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
            
            var id = invite;
            conToVidChat.receiveMatch(id);
            conToVidChat.setMatchId(id.from);

            invite.accept().then(conversationStarted).then(function() {
              self.match.name = conToVidChat.getMatchName();
            });

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
        $scope.$on('$destroy', function() {
          conversation.localMedia.stop();
        });
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
          
          // conToVidChat.inCall = true;
          self.inCall = true;
          

          chatSocket.on('users-connected', function(data) { 
            $scope.$emit('users-connected'); // this will alert app that the timer should start
          }); 

          
        });

        conversation.on('participantDisconnected', function(participant) {
          self.inCall = false;
          conversation.localMedia.stop();
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




