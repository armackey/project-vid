(function() {

  angular
    .module('app')
    .controller('videoChatCtrl', videoChatCtrl);  
    // $inject allows us to properly inject modules in our case the $scope object
    videoChatCtrl.$inject = ['$interval', '$http', '$timeout', 'chatSocket', 'authFact', 'conToVidChat', '$scope'];

    function videoChatCtrl($interval, $http, $timeout, chatSocket, authFact, conToVidChat, $scope) {

      var self = this;

      console.log('refresh');
      var conversationsClient;
      var activeConversation;
      var previewMedia;
      var identity;
      var room;
      var match;
      var noUserFound;
      var token = authFact.getTokenLocalStorage();

      self.currentUser = authFact.getUser();
      // self.isMatched = false;
      // self.counter = 5;
      // self.maxTime = self.counter;

      conToVidChat.connectToSocket();

      // Check for WebRTC
      if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
        alert('WebRTC is not available in your browser.');
      }

      $http.put('/twilioToken', token).then(function(user) {
        identity = user.data.identity;
        console.log(user);
        var accessManager = new Twilio.AccessManager(user.data.token);

        console.log(accessManager);
        // Check the browser console to see your generated identity. 
        // Send an invite to yourself if you want! 

        // Create a Conversations Client and connect to Twilio
        conversationsClient = new Twilio.Conversations.Client(accessManager);
        conversationsClient.listen().then(clientConnected, function (error) {
          log('Could not connect to Twilio: ' + error.message);
        });
      });

      function clientConnected() {
        console.log('clientConnected');
        conToVidChat.searchForMatch().then(function(data) {
          if (data.id) {
            match = data.id;
          } else {
            match = null;
          }
          
          console.log(data);
          conToVidChat.setRoom(data.room);
          
        
      }).then(function() {
          
          if (noUserFound === false)
            return;
          console.log(match);

          conversationsClient.on('invite', function(invite) {
            invite.accept().then(conversationStarted);
            // var id = invite;
            // conToVidChat.receiveRoomId(id);
          });
          if (activeConversation) {
            activeConversation.invite(match);
          } else {
            // Create a conversation
            var options = {};
            if (previewMedia) {
              options.localMedia = previewMedia;
            }

            conversationsClient.inviteToConversation(match, options).then(conversationStarted, function(error) {

              log('Unable to create conversation');
              console.error('Unable to create conversation', error);
              // return clientConnected();
            });
        }});
      }

      // Conversation is live
      function conversationStarted(conversation) {
        log('In an active Conversation');
        console.log(conversation);
        activeConversation = conversation;
        // Draw local video, if not already previewing
        if (!previewMedia) {
          conversation.localMedia.attach('#local-media');
        }

        // When a participant joins, draw their video on screen
        conversation.on('participantConnected', function(participant) {
          console.log(participant);
          log("Participant '" + participant.identity + "' connected");
          participant.media.attach('#remote-media');
          conToVidChat.enterRoom();  // *********** user joining socket room
          console.log('participant connected***************************');
          conToVidChat.inCall = true;
          chatSocket.on('start-timer', function(data) {
            $scope.$emit('emitTimer', data);
            // conToVidChat.setTime(data.time);
          }); // socket should start timer
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




