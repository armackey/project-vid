(function() {
  'use strict';

  angular.module('addTime', [])
    .directive('timer', timer);

  function timer($timeout, $http, $interval, conToVidChat, authFact, $fancyModal) {
    return {
      restrict: 'E',
      scope: true,
      template:
      '<div class="round-progress" round-progress max="maxTime" current="counter" color={{counterColor}} bgcolor="#eaeaea" radius="100" ' +
      'stroke="20" semi="false" rounded="true" clockwise="true" responsive="false" duration="800" ' +
      ' animation="easeInOutQuart" animation-delay="0"></div> ' + 
      '<button class="add-time" ng-click="addTime()">add time</button> ',
      link: function(scope, ele, atts) {

        scope.$on('chat-starts', function() {
          startTimer();
        });

        scope.$on('emit-timer', function() {
          console.log('time should be added');
          startTimer();
        });
        // #45ccce

        var wasCalled = false;

        scope.counter = 0;
        scope.maxTime = scope.counter;
        

        function startTimer() {
          scope.counter += 60;
          scope.maxTime = scope.counter;
          changeColor();
          if (wasCalled)
            return;

          var current;
          var mytimeout = $timeout(onTimeout,1000);


           function onTimeout() {
            wasCalled = true;
            scope.counter--;  
            changeColor();
            current = scope.counter;
            mytimeout = $timeout(onTimeout,1000);
            if (scope.counter <= 0) {
              cancelTick();
            }
          }

          function cancelTick() {
            $timeout.cancel(mytimeout);
            return;
          }

          // $interval(function() {
          //   changeColor();
          // }, 15000);

          scope.addTime = function() {
            conToVidChat.requestAddTime({user: authFact.getUser(), message: 'Would like to add time.'});
          };    
          
        }


        function changeColor() {
          if (scope.counter > 60) {
            scope.counterColor = '#5379E9';
            return;
          } 
          if (scope.counter < 60 && scope.counter > 30) {
            scope.counterColor = '#59E962';
            return;
          } 
          if (scope.counter < 30 && scope.counter > 15) {
            scope.counterColor = '#EAFF7C';
            return;
          }
          if (scope.counter <= 15) {
            scope.counterColor = '#E95D4F';
            return;
          }
        }



      }
    };
  }
})();