(function() {
  'use strict';

  angular
    .module('app')
    .factory('vidcountFact', vidcountFact);

    vidcountFact.$inject = ['chatSocket', 'authFact', '$q', '$rootScope', '$interval', '$timeout'];

    function vidcountFact(chatSocket, authFact, $q, $rootScope, $interval, $timeout) {

      var remaining, mytimeout,
          counter = 0;

      return {

        counterStarted: false,

        startTimer: function(time) {
          
          var self = this;

          if (this.counterStarted) {
            counter += time;  
            return;
          }
          
          counter = time;

          function onTimeout() {
            
            self.counterStarted = true;
            counter--;  
            console.log(counter);
            // changeColor();
            mytimeout = $timeout(onTimeout,1000);
            if (counter <= 0) {
              self.cancelTick();
            }
          }

          mytimeout = $timeout(onTimeout,1000);


        },

        onTimeout: function(counter, counterStarted) {

        },

        cancelTick: function() {
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