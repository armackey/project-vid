(function() {
  'use strict';
  
  angular
    .module('app')
    .controller('videoChatCtrl', videoChatCtrl);  
    // $inject allows us to properly inject modules in our case the $scope object
    videoChatCtrl.$inject = ['$http', 'chatSocket', 'authFact', 'conToVidChat', '$scope', '$rootScope', '$state', 'makeCall'];

    function videoChatCtrl($http, chatSocket, authFact, conToVidChat, $scope, $rootScope, $state, makeCall) {

      // Check for WebRTC
      if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
        alert('WebRTC is not available in your browser.');
      }

      var self = this;

      var token = authFact.getTokenLocalStorage();
      var client; 
      var activeConversation;
      var previewMedia;
      var identity;
      var room;
      var convoStarted;
      var caller = false;
      var _invite;
      var directCall = false;

      self.inCall = false;

      self.currentUser = authFact.getUser();
      self.match = {
        name: conToVidChat.getMatchName() ? conToVidChat.getMatchName() : null,
        id: null,
      };

      // if user leaves, we must stop timers for both users reset page.
      // TODO: if user leaves page, reset isOnline and inCall on server
      $scope.$on('$destroy', function() {
        handleEndingStream();
        chatSocket.emit('leaving-chat', {room: room});
      });

      chatSocket.on('peer-left-chat', function(data) {
        handleEndingStream();
      });


      $rootScope.$on('users-connected', function(event, data) {
        room = conToVidChat.getRoom();
      });

      $rootScope.$on('request-call-invite', function(event, args) {
        directCall = true;
        console.log(args);
        sendInvite(args);
      });

      $rootScope.$on('accept-call-invite', function(event, args) {
        directCall = true;
        console.log('accpeted call');
        acceptInvite(args.caller.id);
      });


      chatSocket.on('receive-random-video-invite', function(data) {
        console.log('received invite');
        if (data.pending_call) {
          console.log('call pending');
          directCall = true;
          // acceptInvite(data.caller.id);  
          return;
        } 
        console.log('made it');
        console.log(data);
        acceptInvite();
      });


      if (directCall || $state.current.name !== 'video-chat') {
        return;
      }

      makeCall.randomMatch().then(function(data) {
        console.log(data);
        client = makeCall.getConversationClient();
        if (data.view) {
          $state.go(data.view);
          return;
        }
        if (data.message) {
          caller = false;
          // wait 10 seconds to receive a call, then search again...
        } else {
          var receiver = {id: data.otherId};
          caller = true;
          self.otherId = data.receiverId;
          self.match.name = data.receiverName;
          conToVidChat.setMatchName(data.receiverName);
          conToVidChat.setRoom(data.room);
          conToVidChat.setMatchId(data.receiverId);
          sendInvite(data); 
        }
      });

      function sendInvite(data) {  
        chatSocket.emit('random-video-invite', data);
        client.inviteToConversation(data.receiverId).then(conversationStarted, function(error) {
          if (error) {
          log('Unable to create conversation');
          console.error('Unable to create conversation', error);
          // return clientConnected();
          }
        });
      }

      function acceptInvite(callerId) {
        console.log(directCall);
        client.on('invite', function(invite) {
          console.log('inside on invite');
          if (directCall) {
            console.log(callerId, invite.from);
            if (callerId !== invite.from) {
              return;
            }
          } 
          console.log(invite);
          conToVidChat.getMatchInfo(invite);
          conToVidChat.setMatchId(invite.from);
          invite.accept().then(conversationStarted).then(function() {
            self.match.name = conToVidChat.getMatchName();
          });
        });

      }

      // Conversation is live
      function conversationStarted(conversation) {

        convoStarted = conversation; 
        console.log(conversation);
        activeConversation = conversation;
        // Draw local video, if not already previewing
        if (!previewMedia) {
          conversation.localMedia.attach('#local-media');
        }

        // When a participant joins, draw their video on screen
        conversation.on('participantConnected', function(participant) {
          console.log('participantConnected');
          console.log(participant);
          conToVidChat.enterRoom();  // *********** user joining socket room
          conToVidChat.justMet();

          // log("Participant '" + participant.identity + "' connected");
          participant.media.attach('#remote-media');
          
          // conToVidChat.inCall = true;
          self.inCall = true;
          

          chatSocket.on('users-connected', function(data) { 
            $rootScope.$broadcast('chat-started', 60);
            // $scope.$emit('users-connected'); // this will alert app that the timer should start
          }); 



          
        });

        conversation.on('participantDisconnected', function(participant) {
          // handleEndingStream();
          log("Participant '" + participant.identity + "' disconnected");
        });

        // When the conversation ends, stop capturing local video
        conversation.on('ended', function(conversation) {
          log("Connected to Twilio. Listening for incoming Invites as '" + client.identity + "'");
          // handleEndingStream();
        });
      }

      function handleEndingStream() {
        if (convoStarted === undefined || self.inCall === false)
          return;
        self.inCall = false;
        convoStarted.localMedia.stop();
        convoStarted.disconnect();
        activeConversation = null;
        $rootScope.$broadcast('chat-ended');
        console.log('someone left');
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




