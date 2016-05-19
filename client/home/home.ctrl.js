(function() {
  

  angular
    .module('app')
    .controller('homeCtrl', homeCtrl);

    homeCtrl.$inject = ['$scope', '$http', '$timeout', '$interval', 'authFact'];
    
    function homeCtrl($scope, $http, $timeout, $interval, authFact) {
      
      var self = this;

    }
    
})();