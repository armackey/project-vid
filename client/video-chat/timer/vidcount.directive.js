(function() {
  'use strict';

  angular
    .module('addTime', [])
    .directive('vidcount', vidcount);

  function vidcount($timeout, $http, $interval, conToVidChat, authFact, $q, $rootScope) {
    return {
      restrict: 'AE',
      require: '^sayCheese',
      template:
      '<div class="round-progress" round-progress max="maxTime" current="counter" color={{counterColor}} bgcolor="#eaeaea" radius="100" ' +
      'stroke="20" semi="false" rounded="true" clockwise="true" responsive="false" duration="800" ' +
      ' animation="easeInOutQuart" animation-delay="0"></div> ' +
      '<img src="./video-chat/shared/images/time-white.svg" class="add-time" ng-click="addTime()">',
      link: function(scope, elem, atts, sayCheese) {

        var counterStarted = false;
        var isPause = false;
        var remaining;
        var mytimeout; 

        scope.counter = 0;


        // scope.$on('chat-starts', function() {
        //   startTimer(60);
        // });

        scope.$on('chat-ended', function() {
          cancelTick();
          console.log('chats over');
        });

        scope.$on('chat-started', function(ev, seconds) {
          startTimer(10);
          console.log('chat-started');
        });
        // #45ccce

        scope.$on('mutual-like', function(){
          pauseCounter();
        });

        function pauseCounter() {
          var deferred = $q.defer();
          remaining = scope.counter;
          cancelTick();
          counterStarted = false;
          isPause = true;
          deferred.resolve(startTimer(5));
          return deferred.promise;
        }

        function resumeCounter() {
          isPause = false;
          counterStarted = false;
          startTimer(remaining);
        }

        function startTimer(time) {
          if (counterStarted) {
            scope.counter += time;  
            return;
          }
          
          scope.counter = time;
          scope.maxTime = scope.counter;
          changeColor();


          mytimeout = $timeout(onTimeout,1000);

          // $interval(function() {
          //   changeColor();
          // }, 15000);

          scope.addTime = function() {
            conToVidChat.requestAddTime({user: authFact.getUser(), message: 'Would like to add time.'});
          };    
          
        }

        function onTimeout() {
          
          counterStarted = true;
          scope.counter--;  
          console.log(scope.counter);
          changeColor();
          mytimeout = $timeout(onTimeout,1000);
          if (scope.counter <= 0) {            
            if (isPause) {
              sayCheese.takePic();
              resumeCounter();
            } else {
              $rootScope.$broadcast('chat-ended');
            }
          }
        }

        function cancelTick() {
          $timeout.cancel(mytimeout);
          counterStarted = false;
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