(function() {
  'use strict';

  angular
    .module('app')
    .factory('msgFact', msgFact);

    msgFact.$inject = ['$http', 'chatSocket', 'authFact', '$q', '$rootScope', 'localStorageService', 'moment'];

    function msgFact($http, chatSocket, authFact, $q, $rootScope, localStorageService, moment) {

      var invite,
          myPhoto = '',
          otherPhoto = '',
          userId,
          otherId,
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

        requestMessages: function(threadId, userId) {
          // if browser is refreshed, app.js will make request for current thread.
          // if state === 'thread' app.js will also make request for current thread.
          // below, we prevent duplicate requests
          // if (this.requestForMessagesSent) { 
          //   return;
          // }

          // if (threadId === null) return;

          var self = this;
          var deferred = $q.defer();
          this.requestForMessagesSent = true;

          $http.put('/getMessages', {threadId: threadId, userId: userId}).then(function(data) {
            deferred.resolve(data);
          }, function(data) {
            deferred.reject(data);
          });

          return deferred.promise;
        },

        getOtherId: function() {
          return otherId;
        },

        setRequestForMessagesSent: function() {
          this.requestForMessagesSent = true;
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

          return newMessageCount;
        },

        resetMessageCount: function() {
          newMessageCount = 0;
        },

        incrementMessageCount: function() {
          newMessageCount++;  
          console.log('newMessageCount', newMessageCount);
          $rootScope.$broadcast('new-message-count');
        },

        // seperate photos
        // orderPhotos: function(photos, userId) {
        //   for (var i = 0; i < photos.length; i++) {
        //     if (photos[i].userId !== userId) {
        //       otherPhoto = photos[i].photo;
        //       return otherPhoto;
        //     } else if (photos[i].userId === userId) {
        //       myPhoto = photos[i].photo; 
        //       return myPhoto;
        //     }
        //   }
        // }

      };



    }



})();