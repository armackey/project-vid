(function() {
  'use strict';

  angular.module('addTime', [])
    .directive('timer', timer);

  function timer($timeout, $http, $interval, conToVidChat) {
    return {
      restrict: 'E',
      scope: true,
      template:
      '<button ng-click="addTime()">add time</button> ' +
      '<div round-progress max="60" current="counter" color="#45ccce" bgcolor="#eaeaea" radius="100" ' +
      'stroke="20" semi="false" rounded="true" clockwise="true" responsive="false" duration="800" ' +
      ' animation="easeInOutQuart" animation-delay="0"></div> ' ,
      link: function(scope, ele, atts) {
        
        scope.$on('timeAdded', function(args) {
          console.log(args);
          gonnaStartTimer(60);
        });



        function gonnaStartTimer(num, addTime) {
          console.log('gonnaStartTimer');
          if (num < 0)
            return;

          if (addTime) {
            scope.counter += addTime;
          }

          var current;
          scope.counter = num;

          scope.onTimeout = function(){
            scope.counter--;
            console.log(scope.counter);
            current = scope.counter;
            mytimeout = $timeout(scope.onTimeout,1000);
            if (scope.counter === 0) {
              $timeout.cancel(mytimeout);
            }
          };

          var mytimeout = $timeout(scope.onTimeout,1000);

          // add time
          scope.addTime = function() {
            // scope.counter += 60;
            conToVidChat.updateTimer(60);
            scope.maxTime = scope.counter; // new max time
            console.log('60 + ' + current  + ' = ' +scope.maxTime);
            console.log('added time + current time = new maxTime time');
          };    


        }
      }
    };
  }
})();