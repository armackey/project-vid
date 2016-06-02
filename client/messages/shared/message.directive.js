(function() {
  'use strict';
  angular.module('messageScroller', [])
    .directive('schrollBottom', schrollBottom);

    function schrollBottom() {        
      return {
        scope: {
          schrollBottom: "="
        },
        link: function (scope, elem) {
          scope.$watchCollection('schrollBottom', function(newValue) {
            if (newValue) {
              console.log(elem);
              elem.scrollTop(elem[0].scrollHeight);
              // element.scrollTop((element)[0].scrollHeight);
            }
          });
        }
      };
    }
  
})();