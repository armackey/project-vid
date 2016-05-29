// (function() {
//   'use strict'    
  
//   angular
//     .module('app')
//     .controller('authCtrl', authCtrl); 

//     authCtrl.$inject = ['authFact', '$http', '$q', '$state', 'fbFact', 'conToVidChat'];

//     function authCtrl(authFact, $http, $q, $state, fbFact, conToVidChat) {
//       var deferred = $q.defer();

//       var self = this;

//       self.login = function() {
//         fbFact.facebookLogin().then(function(response) {
          
//           var accessToken = FB.getAuthResponse();
//           var myInfo = response;

//           myInfo.token = accessToken.accessToken;

//           $http.post('/login', myInfo).then(function(data) {
          
//             // setUserInfo(myInfo);
//             // conToVidChat.setLikes(data.data.likes);
//             // $state.go(data.data.view);
//           });
//         });
//       };

//       self.logOut = function() {
//         $state.go('home');
//         authFact.setUser(null);
//         authFact.logOut();
//       };

//       function setUserInfo(user) {
//         authFact.setUser(user.name);
//         authFact.setTokenLocalStorage({token: user.token, username: user.name});
//       }

//     }

  
// })();