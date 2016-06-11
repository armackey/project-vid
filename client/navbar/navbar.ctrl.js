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
        settings: {
          name: 'settings',
          url: 'settings'
        },
        video: {
          name: 'video chat',
          url: 'video-chat'
        },
      };

       self.activeClass = function(arg) {
        if (self.locationActive) {
          self.locationActive = false;
          return;
        }

        console.log('state changed');
        // console.log($location.url());
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
            setUserInfo(myInfo);
          });
        });
      };

      function setUserInfo(user) {
        authFact.setUser(user.name);
        authFact.setTokenLocalStorage({token: user.token, username: user.name, userId: user.id});
        console.log('setUserInfo');
      }

      self.logOut = function() {
        $state.go('home');
        authFact.setUser(null);
        authFact.logOut();
      };

    }

})();