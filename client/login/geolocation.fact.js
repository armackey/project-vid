(function() {
  'use strict';

  angular
    .module('app')
    .factory('geolocationFact', geolocationFact);

    geolocationFact.$inject = ['$q', '$window'];

    function geolocationFact($q, $window) {


      return {
        getCurrentPosition: function() {
          var deferred = $q.defer();
          if (!$window.navigator.geolocation) {
            deferred.reject('Geolocation not supported.');
          } else {
            $window.navigator.geolocation.getCurrentPosition(function(position) {
              deferred.resolve(position);
            },
            function (err) {
              deferred.reject(err);
            });
          }
          return deferred.promise;
        }
      };
    }

})();