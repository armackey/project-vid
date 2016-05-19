(function() {
  'use strict'    
  
  angular
    .module('app')
    .controller('navbarCtrl', navbarCtrl); 

    navbarCtrl.$inject = ['authFact', '$http', '$q', '$state', 'fbFact'];

    function navbarCtrl(authFact, $http, $q, $state, fbFact) {
      
      var self = this;
      self.loggedIn = authFact.getUser();

      self.login = function() {
        fbFact.facebookLogin().then(function(response) {
          
          var accessToken = FB.getAuthResponse();
          var myInfo = response;
          myInfo.token = accessToken.accessToken;
          $http.post('/login', myInfo).then(function(data) {
            setUserInfo(myInfo);
            $state.go(data.data.view);
          });
        });
      };

      function setUserInfo(user) {
        authFact.setUser(user.name);
        authFact.setTokenLocalStorage({token: user.token, username: user.name});
      }

      self.logOut = function() {
        $state.go('home');
        authFact.setUser(null);
        authFact.logOut();
      };

    }

})();