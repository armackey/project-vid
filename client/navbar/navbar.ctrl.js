(function() {
  'use strict';  
  
  angular
    .module('app')
    .controller('navbarCtrl', navbarCtrl); 

    navbarCtrl.$inject = ['authFact', '$http', '$q', '$state', 'fbFact', 'conToVidChat', '$location', 'msgFact', '$rootScope', 'geolocationFact'];

    function navbarCtrl(authFact, $http, $q, $state, fbFact, conToVidChat, $location, msgFact, $rootScope, geolocationFact) {
      
      var self = this;
      var myInfo = {};
      var position;
      
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

        self.locationActive = true;
      };

      self.login = function() {
        geolocationFact.getCurrentPosition().then(function(mypos) {
          position = {longitude: mypos.coords.longitude, latitude: mypos.coords.latitude};
          
          
      
        }).then(function() {

          fbFact.facebookLogin().then(function(response) {

            var accessToken = FB.getAuthResponse();

            myInfo = response;
            myInfo.token = accessToken.accessToken;
            myInfo.position = position;
            console.log(myInfo);

            $http.post('/login', myInfo).then(function(data) {
              var view = data.data.view;
              myInfo.id = data.data.id;
              myInfo.picture = data.data.picture;
              
              self.profile = data.data.picture;
              setUserInfo(myInfo, view);
              console.log(data);
            });
          });
        });
      };



      function setUserInfo(user, view) {
        authFact.setTokenLocalStorage({token: user.token, username: user.name, userId: user.id, profilePic: user.picture});
        authFact.setUser(user.name);
        $state.go(view);
      }

      self.logOut = function() {
        console.log('logout');
        
        authFact.setUser(null);
        authFact.logOut();
        $state.go('home');
      };

    }

})();