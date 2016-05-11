(function() {
  'use strict';

  angular
    .module('app')
    .factory('authFact', authFact);

    authFact.$inject = ['$q', '$http', 'localStorageService', '$state'];

    function authFact($q, $http, localStorageService, $state) {
      
      var currentUser = null;

      return {

        setUser: function(user) {
          
          var deferred = $q.defer();
          currentUser = user;
          deferred.resolve(currentUser);
          return deferred.promise;
        },

        getUser: function() {
          return currentUser ? currentUser : false;
        },

        setTokenLocalStorage: function(token) {
          return localStorageService.set('dating-token', token);
        },

        getTokenLocalStorage: function(token) {
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