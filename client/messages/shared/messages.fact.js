(function() {
  'use strict';

  angular
    .module('app')
    .factory('msgFact', msgFact);

    msgFact.$inject = ['$http', 'chatSocket', 'authFact', '$q', '$rootScope', 'localStorageService'];

    function msgFact($http, chatSocket, authFact, $q, $rootScope, localStorageService) {

      var self = this,
          messagesArray = [],
          newMessageCount = 0,
          token;


      return {

        requestForMessagesSent: false,
        isIncremented: false,

        requestThreads: function() {
          if (!token) {
            token = authFact.getTokenLocalStorage();
          }

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
              if (messages[i].unread && newMessageCount > 0) {
                newMessageCount--;
              }
              messagesArray.push({message: messages[i].message, from: messages[i].from, date: messages[i].created_at});
              $rootScope.$emit('new-message-count');
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
        },

        getMessageCount: function() {
          // this function gets call a lot when clicked on thread... have to figure out why...
          if (newMessageCount < 1) {
            return;
          }
          // console.log('line 80 msg.fact');
          // console.log('newMessageCount', newMessageCount);
          return newMessageCount;
        },

        resetMessageCount: function() {
          newMessageCount = 0;
        },

        incrementMessageCount: function() {
          console.log('ran');
          newMessageCount++;  
          console.log('newMessageCount', newMessageCount);
          $rootScope.$broadcast('new-message-count');
        }

      };



    }



})();