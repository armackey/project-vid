(function() {

  angular
    .module('app')
    .controller('settingsCtrl', settingsCtrl); 

    settingsCtrl.$inject = ['authFact', '$http', '$q', '$state'];

    function settingsCtrl(authFact, $http, $q, $state) {
      
      var self = this;
      console.log('settings');

      self.me = {
        preferences: {
          iWantToMeet: self.iWantToMeet,
          ltAge: self.ltAge,
          gtAge: self.gtAge
        },
          gender: self.gender,
          myAge: self.myAge,
          token: authFact.getTokenLocalStorage().token
      };

      self.identifyAs = [
        {sex: 'male'},
        {sex: 'female'}
      ];

      self.hereToMeet = [
        {sex: 'male'},
        {sex: 'female'},
        {sex: 'both'}
      ];

      self.ageRange = [
        {age: 18},{age: 19},
        {age: 20},{age: 21},{age: 22},{age: 23},{age: 24},{age: 25},{age: 26},{age: 27},{age: 28},{age: 29},
        {age: 30},{age: 31},{age: 32},{age: 33},{age: 34},{age: 35},{age: 36},{age: 37},{age: 38},{age: 39},
        {age: 40},{age: 41},{age: 42},{age: 43},{age: 44},{age: 45},{age: 46},{age: 47},{age: 48},{age: 49},
        {age: 50},{age: 51},{age: 52},{age: 53},{age: 54},{age: 55},{age: 56},{age: 57},{age: 58},{age: 59},
        {age: 60},{age: 61},{age: 62},{age: 63},{age: 64},{age: 65},{age: 66},{age: 67},{age: 68},{age: 69},
        {age: 70},{age: 71},{age: 72},{age: 73},{age: 74},{age: 75},{age: 76},{age: 77},{age: 78},{age: 79},
        {age: 80},{age: 81},{age: 82},{age: 83},{age: 84},{age: 85},{age: 86},{age: 87},{age: 88},{age: 89},
        {age: 90},{age: 91},{age: 92},{age: 93},{age: 94},{age: 95},{age: 96},{age: 97},{age: 98},{age: 99},
      ];
        

      self.sendPref = function() {
        $http.put('/preferences', self.me).success(function() {
          // console.log('change page');
          // $state.go('video-chat');
        }).error(function(err) {
          console.log(err);
        });
        $state.go('video-chat');
      };

    }

})();