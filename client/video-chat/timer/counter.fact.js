(function() {
  'use strict';

  angular
    .module('app')
    .factory('counterFact', counterFact);

    counterFact.$inject = ['chatSocket', 'authFact', '$q', '$rootScope', '$interval', '$timeout'];

    function counterFact(chatSocket, authFact, $q, $rootScope, $interval, $timeout) {

      var remaining, mytimeout; 
      var counter = 0;


      return {

        counterStarted: false,

        startTimer: function(time) {
          
          var self = this;
          var deferred = $q.defer();

          // if (this.counterStarted) {
          //   counter += time;  
          //   return;
          // }
          
          counter = time;

          function onTimeout() {
            
            self.counterStarted = true;
            counter--;  
            
            // changeColor();
            mytimeout = $timeout(onTimeout,1000);
            if (counter <= 0) {
              self.counterStarted = false;
              self.cancelTick();
              deferred.resolve();
            }
          }

          mytimeout = $timeout(onTimeout,1000);

          return deferred.promise;
        }, 

        onTimeout: function(counter, counterStarted) {

        },

        cancelTick: function() {
          console.log('tick cancelled');
          $timeout.cancel(mytimeout);
        },

        getCounter: function() {
          return counter;
        },

        pauseCounter: function() {
          this.counterStarted = false;
          remaining = counter;
          this.cancelTick();
        },

        resumeCounter: function() {
          this.counterStarted = false;
          this.startCounter(remaining);
        }



      };

    }

})();