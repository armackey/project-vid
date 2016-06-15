(function() {
  'use strict';  
  
  angular
    .module('app')
    .controller('navbarCtrl', navbarCtrl); 

    navbarCtrl.$inject = ['authFact', '$http', '$q', '$state', 'fbFact', 'conToVidChat', '$location', 'msgFact', '$rootScope'];

    function navbarCtrl(authFact, $http, $q, $state, fbFact, conToVidChat, $location, msgFact, $rootScope) {
      
      var self = this;
      var myInfo;
      
      self.loggedIn = authFact.getUser();
      self.locationActive = false;
      // self.newMessageCount = msgFact.getMessageCount() === 0 ? '' : msgFact.getMessageCount();


      $rootScope.$on('new-message-count', function(data) {
        self.newMessageCount = msgFact.getMessageCount();
      });


      self.pages = {
        messages: {
          name: 'messages',
          url: 'messages'
        },
        video: {
          name: 'video chat',
          url: 'video-chat'
        },
        // profile: {
        //   url: 'settings',
        //   picture: authFact.getTokenLocalStorage().profilePic
        // }
      };

      self.profile = {
        url: 'myprofile',
        picture: !authFact.getTokenLocalStorage() ? null : authFact.getTokenLocalStorage().profilePic
      };

       self.activeClass = function(arg) {
        if (self.locationActive) {
          self.locationActive = false;
          return;
        }

        console.log('state changed');
        self.locationActive = true;
      };

      self.login = function() {
        fbFact.facebookLogin().then(function(response) {
          
          var accessToken = FB.getAuthResponse();

          myInfo = response;
          myInfo.token = accessToken.accessToken;

          $http.post('/login', myInfo).then(function(data) {
            $state.go(data.data.view);
            myInfo.id = data.data.id;
            myInfo.picture = data.data.picture;
            
            self.profile = data.data.picture;
            console.log(self.profile);
            setUserInfo(myInfo);
          });
        });
      };

      function setUserInfo(user) {
        authFact.setUser(user.name);
        authFact.setTokenLocalStorage({token: user.token, username: user.name, userId: user.id, profilePic: user.picture});
        console.log('setUserInfo');
      }

      self.logOut = function() {
        $state.go('home');
        authFact.setUser(null);
        authFact.logOut();
      };

    }

})();