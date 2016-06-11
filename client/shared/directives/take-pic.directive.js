(function() {

  angular
    .module('takePic', [])
    .directive('picture', picture);

  function picture(chatSocket, conToVidChat, authFact) {
    return {
      restrict: 'E',
      template: '<button ng-click="takePic()">Take Picture</button>' +
                '<canvas id="canvas"></canvas>',
      link: function(scope, elem, atts) {

        var myVideo,
            data,
            userId = authFact.getTokenLocalStorage().userId;

        // TODO: if retake true/else....

        scope.$on('mutual-like', function() {
          console.log('mutual-like');
          scope.takePic();
        });

        scope.takePic = function() {

          var canvas  = elem.children()[1],
              context = canvas.getContext('2d'),
              myVideo = document.getElementById('local-media').querySelector('video'),
              width   = 320,
              height  = 200;

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