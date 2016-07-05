(function() {
  'use strict';

  angular
    .module('takePic', [])
    .directive('sayCheese', sayCheese);

  function sayCheese(chatSocket, conToVidChat, authFact) {
    return {
      restrict: 'AE',
      transclude: true,
      template:
      '<div ng-transclude></div> <div id="myCanvas"></div>'+ 
      '<button ng-click="takePic()">button</button>',
      controller: function($scope) {
        this.takePic = function() {
          $scope.takePic();
          console.log('say cheese');
        };
      },

      link: function(scope, elem, atts) {


        var myVideo,
            data,
            userId = authFact.getTokenLocalStorage().userId;

        scope.isMutual = false;

        // TODO: if retake true/else....

        scope.$on('mutual-like', function() {
          scope.isMutual = true;
        });

        scope.takePic = function() {
          var myCanvasId = document.getElementById('myCanvas');
          var canvas  = document.createElement('canvas');
          var context = canvas.getContext('2d'),
              myVideo = document.getElementById('local-media').querySelector('video'),
              width = 320,
              height = 200;

          myCanvasId.appendChild(canvas);

          myVideo.setAttribute('width', width);
          myVideo.setAttribute('height', height);
          canvas.setAttribute('width', width);
          canvas.setAttribute('height', height);
          canvas.width = width;
          canvas.height = height;

          
          context.drawImage(myVideo, 0, 0, width, height);

          data = canvas.toDataURL("image/png");
          
          
          console.log(data.length);

          chatSocket.emit('mutual-like', {room: conToVidChat.getRoom(), photo: data, name: authFact.getUser(), id: userId});
        };

        // remote video gets larger
        // timer pauses
        // 3 second timer begins
        // picture taken and stored on db


        
      }
    };
  }

})();