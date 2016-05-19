(function() {

  angular
    .module('app')
    .controller('settingsCtrl', settingsCtrl); 

    settingsCtrl.$inject = ['authFact', '$http', '$q', '$state'];

    function settingsCtrl(authFact, $http, $q, $state) {
      
      var self = this;
      self.myName = authFact.getUser();
      

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

      self.ageRange = [];

      for (var i = 18; i <= 99; i+=1) {
        self.ageRange.push({age: i});
      }
        

      self.sendPref = function() {
        if (!self.me.preferences.iWantToMeet || !self.me.preferences.ltAge || !self.me.preferences.gtAge || !self.me.gender || !self.me.myAge) {
          console.log('something missing');
          return;
        }
        $state.go('video-chat');
        $http.post('/preferences', self.me).success(function(data) {

        });
      };

    }

})();