(function() {

  angular
    .module('app')
    .controller('loginCtrl', loginCtrl); 

    loginCtrl.$inject = ['authFact', '$http', '$q', '$state'];

    function loginCtrl(authFact, $http, $q, $state) {
      var deferred = $q.defer();

      var self = this;

      self.login = function() {
        $http.get('/login').then(function(user) {
          console.log(user);
          var token = {
            token: user.data.token,
            currentUser: user.data.name
          };

          var username = user.data.name;

          authFact.setUser(username);
          authFact.setTokenLocalStorage(token);
          deferred.resolve(user);
        });
        return deferred.promise;
      };

      self.logOut = function() {
        $state.go('home');
        authFact.setUser(null);
        authFact.logOut();
      };

    }

  
})();