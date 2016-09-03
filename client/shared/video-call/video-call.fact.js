(function(){
  'use strict';

  angular
    .module('app')
    .factory('makeCall', makeCall);

    makeCall.$inject = ['$http', 'authFact', 'chatSocket', '$rootScope', '$q'];

    function makeCall($http, authFact, chatSocket, $rootScope, $q) {

      var token;
      var haveTwilToken = false;
      var client;
      var activeConversation;
      var _invite;


      return {
        // need twilio token in order make and receive calls
        getTwilioToken: function() {
          var self = this;
          haveTwilToken = true;
          token = authFact.getTokenLocalStorage();
          
          $http.put('/twilioToken', token).then(function(data) {

            var accessManager = new Twilio.AccessManager(data.data.token);
            // Create a Conversations Client and connect to Twilio
            client = new Twilio.Conversations.Client(accessManager);
            client.listen().then(function(error) {
              console.dir(error);
              if (error) {
                console.log('Could not connect to Twilio: ' + error);  
              }
            });
          });
        },

        randomMatch: function() {
          var deferred = $q.defer();
          $http.put('/searchForMatch', token).then(function(user) {
            deferred.resolve(user.data);
          }, function(user) {
            deferred.reject(user);
          });
          return deferred.promise;
        },

        sendInvite: function(invitee) {
          var data = authFact.getUser();
          var deferred = $q.defer(); 
          console.log('i sent invite');
          // chatSocket.emit('send-invite', data);

          client.on('invite', function(invite) {
            _invite = invite;
            client.inviteToConversation(invitee);
          });
          // deferred.resolve(client.inviteToConversation(invitee));
          // return deferred.promise;
        },

        setInviteObj: function(arg) {
          console.log(arg);
          _invite = arg;
        },

        getInviteObj: function() {
          return _invite;
        },

        // acceptInvite: function() {
        //   var self = this;
        //   client.on('invite', function (invite) {
        //     console.log('Incoming invite from: ' + invite.from);
        //     invite.accept().then(self.conversationStarted);
        //   });
        // },

        getConversationClient: function() {
          return client;
        },

        returnTwiloStatus: function() {
          return haveTwilToken;
        },

      };
    }
})();