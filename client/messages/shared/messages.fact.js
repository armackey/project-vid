(function() {
  'use strict';

  angular
    .module('app')
    .factory('msgFact', msgFact);

    msgFact.$inject = ['$http', 'chatSocket', 'authFact', '$q', '$rootScope', 'localStorageService'];

    function msgFact($http, chatSocket, authFact, $q, $rootScope, localStorageService) {

      var self = this,
          token = authFact.getTokenLocalStorage(),
          messagesArray = [],
          threadId;

      return {

        requestForMessagesSent: false,

        requestThreads: function() {

          var deferred = $q.defer();
          this.requestForMessagesSent = false;

          $http.put('/threads', token).then(function(data) {
            deferred.resolve(data);
          }, function(data) {
            deferred.reject(data);
          });
            return deferred.promise;
        },

        requestMessages: function(id) {
          // if browser is refreshed, app.js will make request for current thread.
          // if state === 'thread' app.js will also make request for current thread.
          // below, we prevent duplicate requests
          if (this.requestForMessagesSent) { 
            return;
          }

          var deferred = $q.defer();
          messagesArray = [];
          this.requestForMessagesSent = true;

          $http.put('/getMessages', {id: id}).then(function(data) {
            var messages = data.data.content;
            for (var i = 0; i < messages.length; i++) {
              messagesArray.push({message: messages[i].message, from: messages[i].from});
            }
          });
        },

        getMessages: function(id) {
          return messagesArray;
        },

        storeThreadItems: function(items) {
          return localStorageService.set('dating-token.threadItems', items);
        },

        getThreadItems: function(id) {
          return localStorageService.get('dating-token.threadItems');
        }

      };



    }



})();