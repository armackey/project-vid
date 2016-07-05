(function() {
  'use strict';  

  angular
    .module('app')
    .controller('settingsCtrl', settingsCtrl); 

    settingsCtrl.$inject = ['authFact', '$http', '$q', '$state', 'makeCall', 'chatSocket', '$fancyModal'];

    function settingsCtrl(authFact, $http, $q, $state, makeCall, chatSocket, $fancyModal) {
      
      var self = this;
      var storageInfo = authFact.getTokenLocalStorage();
      var conversationsClient = makeCall.getConversationClient();

      self.myName = authFact.getUser();
      self.ageRange = [];
      self.peopleMet = [];  

      console.log(authFact.getTokenLocalStorage());

      chatSocket.on('call-result', function(data) {

      });   

      chatSocket.on('call-received', function(data) {
        conversationsClient.on('invite', function(invite) {
          console.log('Incoming invite from: ' + invite.from);
          invite.accept().then(makeCall.conversationStarted());
        });
      });
      

      self.me = {
        preferences: {
          iWantToMeet: self.iWantToMeet,
          ltAge: self.ltAge,
          gtAge: self.gtAge
        },
          gender: self.gender,
          myAge: self.myAge,
          token: authFact.getTokenLocalStorage().token,
          distance: self.distance
      };

      self.distanceAway = [
        {miles: 25},
        {miles: 50},
        {miles: 100}
      ];

      self.identifyAs = [
        {sex: 'male'},
        {sex: 'female'}
      ];

      self.hereToMeet = [
        {sex: 'male'},
        {sex: 'female'},
        {sex: 'both'}
      ];

      for (var i = 18; i <= 30; i+=1) {
        self.ageRange.push(i);
        self.me.preferences.gtAge = self.ageRange[0];
        self.me.preferences.ltAge = self.ageRange[0];
        self.me.myAge = self.ageRange[0];
      }


      $http.put('/showPrevPreferences', {id: storageInfo.userId}).then(function(data) {
        if (!data) return;
        if (data.data.view) {
          $state.go(data.data.view);
          return;
        }
        var pref = data.data;
      
        self.me.preferences.gtAge = pref.preferences.age.gt;
        self.me.preferences.ltAge = pref.preferences.age.lt;
        self.me.myAge = pref.age;

        self.me.preferences.iWantToMeet = pref.preferences.iWantToMeet;
        self.me.gender = pref.gender;
        self.me.distance = pref.distance;
      });


       
      self.peopleMet.push({id: '5762e7094a41ab214ca18d12', date: "2016-06-16T17:57:38.064Z", mutual: false, name: 'One cool guy', photo: "https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.50.50/p50x50/1379841_10150004552801901_469209496895221757_n.jpg?oh=41eda0af5152a6d5673b221f24b4c2a4&oe=57C7B633"});
      self.peopleMet.push({id: '5762e7094a41ab214ca18d12', date: "2016-06-16T17:57:38.064Z", mutual: true, name: 'Wonder Woman', photo: "https://scontent.xx.fbcdn.net/v/t1.0-1/c15.0.50.50/p50x50/1379841_10150004552801901_469209496895221757_n.jpg?oh=41eda0af5152a6d5673b221f24b4c2a4&oe=57C7B633"});
      $http.put('/stats', storageInfo).then(function(data) {
        if (!data) return;
        if (data.data.view) {
          $state.go(data.data.view);
          return;
        }
        if (data.data.message) {
          // message = data.data.message
          return;
        }
        data.data.people_met.map(function(elem, i) {
          self.peopleMet.push({id: elem.user_id, date: elem.created_at, mutual: elem.mutual, name: elem.name, photo: elem.picture, games: elem.games_played});
        });
      });
        

      self.sendPref = function() {

        if (!self.me.preferences.iWantToMeet || !self.me.gender) {
          $fancyModal.open({
            template: '<p>Missing fields</p>',
            showCloseButton: true,
            closeOnOverlayClick: false
          });
          return;
        }

        if (self.me.preferences.gtAge.age > self.me.preferences.ltAge.age) {
          $fancyModal.open({
            template: '<p>Switch ages..</p>',
            showCloseButton: true,
            closeOnOverlayClick: false
          });
          return;
        }

        $http.post('/preferences', {preferences: self.me, id: storageInfo.userId}).then(function(data) {
          if (!data) return;
          if (data.data.view) {
            $state.go(data.data.view);
            return;
          }
          console.log(data);
        });
      };

    }

})();