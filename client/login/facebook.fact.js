(function() {
  'use strict'; 
  
  angular
    .module('app')
    .factory('fbFact', fbFact); 

    fbFact.$inject = ['$q'];

    function fbFact($q) {

      var deferred = $q.defer();

      return {

        facebookLogin: function() {
          FB.login(function(response) {

            if (response.authResponse) { 
                         
              FB.api('/me', {fields: ['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'picture']}, function(response) {
                deferred.resolve(response);
              });

            } else {

              deferred.reject(response);

            }
          });
          return deferred.promise;
        }

      };



    }

})();