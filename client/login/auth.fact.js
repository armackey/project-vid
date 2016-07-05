(function() {
  'use strict';

  angular
    .module('app')
    .factory('authFact', authFact);

    authFact.$inject = ['$q', '$http', 'localStorageService', '$state', '$window'];

    function authFact($q, $http, localStorageService, $state, $window) {
      
      var currentUser = null;


      return {

        setUser: function(user) {  
          currentUser = user;
        },

        getUser: function() {
          return currentUser;
        },

        setTokenLocalStorage: function(token) {
          return localStorageService.set('dating-token', token);
        },

        getTokenLocalStorage: function() {
         return localStorageService.get('dating-token');
        },

        logOut: function() {
          return localStorageService.clearAll();
        },

        isOnline: function() {
          $http.put('/isOnline', this.getTokenLocalStorage().token).then(function(data) {
            
          });
        }



      };

    }


})();