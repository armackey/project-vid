(function() {
  'use strict';
  
  angular
    .module('app')
    .controller('videoChatCtrl', videoChatCtrl);  
    // $inject allows us to properly inject modules in our case the $scope object
    videoChatCtrl.$inject = ['$http', 'chatSocket', 'authFact', 'conToVidChat', '$scope', '$rootScope', '$state', 'makeCall', 'counterFact'];

    function videoChatCtrl($http, chatSocket, authFact, conToVidChat, $scope, $rootScope, $state, makeCall, counterFact) {

      // Check for WebRTC
      if (!navigator.webkitGetUserMedia && !navigator.mozGetUserMedia) {
        alert('WebRTC is not available in your browser.');
      }

      var localMedia = new Twilio.Conversations.LocalMedia();
      console.log(localMedia);

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
      var acceptedInvite = false;
      var searchForMatchAttempt = 0;

      self.inCall = false;
      self.currentUser = authFact.getUser();

      self.match = {
        name: conToVidChat.getMatchName() ? conToVidChat.getMatchName() : null,
        id: null,
      };

      conToVidChat.inMatching({inMatch: true});

      // if user leaves, we must stop timers for both users reset page.
      // TODO: if user leaves page, reset isOnline and inCall on server
      $scope.$on('$destroy', function() {
        handleEndingStream();
        counterFact.cancelTick();
        conToVidChat.inMatching({inMatch: false});
        chatSocket.emit('leaving-chat', {room: room});
        $rootScope.$broadcast('chat-ended');
      });

      chatSocket.on('peer-left-chat', function(data) {
        handleEndingStream();
        console.log('peer left');
      });

      $scope.$on('chat-ended', function() {
        handleEndingStream();
        console.log('chat ended');
      });


      // $rootScope.$on('users-connected', function(event, data) {
      //   room = conToVidChat.getRoom();
      // });

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
        conToVidChat.setRoom(data.room);
        acceptInvite();
      });


      if (directCall || $state.current.name !== 'video-chat') {
        return;
      }

      randomMatch();

      function randomMatch() {
        if (self.inCall || $state.current.name !== 'video-chat') return;
        console.log('randomMatch');

        

        makeCall.randomMatch().then(function(data) {
          console.log(data);
          client = makeCall.getConversationClient();
          if (data.view) {
            $state.go(data.view);
            return;
          }
          if (data.message) {
            caller = false;
            self.message = data.message;
            searchForMatchAttempt++; 

            counterFact.startTimer(5).then(function() {  // wait 10 seconds to receive a call, then search again...
              randomMatch();
              
              if (searchForMatchAttempt > 5) {
                console.log('expand search'); // ask user to expand search from ex. 25 miles to 50
              }

            });

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
      }

      function sendInvite(data) {  
        console.log('send invite');
        if (self.inCall) return;
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

        if (self.inCall) return;
        
        client.on('invite', function(invite) {
          if (directCall) {
            console.log(callerId, invite.from);
            if (callerId !== invite.from) {
              return;
            }
          } 
          
          if (acceptedInvite) return;
          
          console.log('accepted invite: ' + acceptedInvite + ' self.inCall: ' + self.inCall);
          acceptedInvite = true;
          conToVidChat.getMatchInfo(invite);
          conToVidChat.setMatchId(invite.from);
          invite.accept().then(conversationStarted).then(function() {
            self.match.name = conToVidChat.getMatchName();
          });
        });

      }

      function conversationStarted(conversation) {
        console.log('conversationStarted', self.inCall);
        if (self.inCall) return;

        convoStarted = conversation; 
        log(conversation);
        console.log(conversation);
        console.log(conversation.localMedia);
        activeConversation = conversation;
        // Draw local video, if not already previewing
        if (!previewMedia) {
          conversation.localMedia.attach('#local-media');
        }

        // When a participant joins, draw their video on screen
        conversation.on('participantConnected', function(participant) {

          if (self.inCall) return;

          console.log('participantConnected');
          self.inCall = true;

          conToVidChat.enterRoom({inCall: true});  // *********** user joining socket room
          conToVidChat.justMet();

          if (counterFact.counterStarted) {
            counterFact.cancelTick();
          }

          // log("Participant '" + participant.identity + "' connected");
          participant.media.attach('#remote-media');
          
          // conToVidChat.inCall = true;
          

          $rootScope.$broadcast('chat-started', 60);

          // chatSocket.on('users-connected', function(data) { 
          //   console.log('users-connected');
            
          //   // $scope.$emit('users-connected'); // this will alert app that the timer should start
          // }); 
          
        });

        

        conversation.on('participantDisconnected', function(participant) {
          // convoStarted.localMedia.stop();
          // convoStarted.disconnect();
          convoStarted = null;
          self.inCall = false;
          handleEndingStream();
          log("Participant '" + participant.identity + "' disconnected");
        });

        // When the conversation ends, stop capturing local video
        conversation.on('ended', function(conversation) {
          log("Connected to Twilio. Listening for incoming Invites as '" + client.identity + "'");
          handleEndingStream();
        });
      }

      function handleEndingStream() {
        console.log('handleEndingStream');
        
        acceptedInvite = false;
        conToVidChat.exitCall(false);
        randomMatch();

        if (!convoStarted || !self.inCall) {
          log('self.inCall: ' + self.inCall + ' convoStarted ' + convoStarted);
          return;
        }

        convoStarted.disconnect();
        convoStarted = null;
        self.inCall = false; 
        convoStarted = null;
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




