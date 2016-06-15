(function() {
  'use strict';

  angular
    .module('app')
    .controller('messageCtrl', messageCtrl);

    messageCtrl.$inject = ['$http', 'chatSocket', 'authFact', 'msgFact', '$rootScope', '$scope'];
    
    function messageCtrl($http, chatSocket, authFact, msgFact, $rootScope, $scope) {

      var self = this,
          threadId,
          otherPhotos,
          myPhotos,
          userId = authFact.getTokenLocalStorage() === null ? null : authFact.getTokenLocalStorage().userId;

      self.threads = [];
      self.messages = msgFact.getMessages();
      self.currentUser = authFact.getUser();
      self.otherUser = msgFact.getThreadItems() === null ? null : msgFact.getThreadItems().threadName;
      self.isChecked = false;
      self.noMessages = '';

      self.otherPhoto = '';
      self.myPhoto = '';

      // console.log(self.otherPhoto);

      $scope.$on('$destroy', function() {
        threadId = '';
      });

      // currently receiving data multiple times... sometimes.
      chatSocket.on('message-receive', function(data) { 
        if (data.from === self.currentUser) {
          return; 
        }

        self.messages.push({message: data.message, from: data.from, date: data.created_at});
        findAndUpdateThread(data);
        
        if (data.threadId !== threadId) { // if user is on current thread, they should not see message incrementing
          msgFact.incrementMessageCount();  
        }
      });

      msgFact.requestThreads().then(function(data) {

        var threads = data.data;
        if (threads.length < 1) {
          self.noMessages += 'No messages found. Let\'s meet some folks!' ;
          return;
        }
        // count has to reset or else returning to 'message' state will cause message count to increase on prev. messages
        msgFact.resetMessageCount(); 
        for (var i = 0; i < threads.length; i++) {
          orderThreads(threads[i].content.messages, threads[i].id, orderPhotos(threads[i].content.users, userId));
        }    
      });

      // will display last message sent from other users
      function orderThreads(messages, id, photo) {
        for (var i = messages.length - 1; i >= 0; i--) {
          // if (!messages[i].message) continue;
          if (messages[i].from !== self.currentUser) {
            if (messages[i].unread) {
              msgFact.incrementMessageCount(); // setting our number of unread messages
            }
            self.threads.push({id: id, message: checkMessageLength(messages[i].message), from: messages[i].from, unread: messages[i].unread, date: messages[i].created_at, otherPhotos: self.otherPhoto, myPhotos: self.myPhoto});
            break;
          }
        }
      }

      function orderPhotos(photos, userId) {
        for (var i = 0; i < photos.length; i++) {
          if (photos[i].userId !== userId) {
            self.otherPhoto = photos[i].photo;
          } else if (photos[i].userId === userId) {
            self.myPhoto = photos[i].photo; 
          }
        }
      }

      function checkMessageLength(message) {
        if (!message) {
          message = 'Yay! You two liked each other! Continue the conversation. -Blur';
        }
        if (message.length < 36) {
          return message;
        }
        var splitMessage = message.split('');
        var shortMessage;
        for (var i = 0; i < splitMessage.length; i++) {
          if (i === 32) {
            splitMessage[i] += '...';
            shortMessage = splitMessage.join('');
            break;
          }
        }
        return shortMessage.substring(-1, 36);
      }

      function findAndUpdateThread(newThread) {
        for (var i = 0; i < self.threads.length; i++) {
          
          if (self.threads[i].id === newThread.id) {
            self.threads.splice(i,1);
          }
        }
        self.threads.unshift({id: newThread.id, message: checkMessageLength(newThread.message), from: newThread.from, unread: newThread.unread, date: newThread.created_at, otherPhotos: newThread.otherPhoto, myPhotos: newThread.myPhoto});
      }
      
      self.threadClicked = function(id, threadName) {  
        threadId = id;
        msgFact.requestMessages(threadId, userId);
        msgFact.storeThreadItems({threadId: threadId, threadName: threadName});
      };

      self.checkbox = function() {
        if (!self.isChecked) 
          self.isChecked = true;
        else
          self.isChecked = false;
      };

      self.sendMessage = function() {
        if (self.saySomething === '' || self.saySomething === undefined) {
          return;
        }

        self.message = {
          from: authFact.getUser(),
          message: self.saySomething,
          unread: true,
          otherPhoto: self.otherPhoto,
          myPhoto: self.myPhoto,
          id: msgFact.getThreadItems().threadId,
          created_at: Date.now()
        };

        self.messages.push({message: self.message.message, from: self.message.from, date: self.message.created_at});

        chatSocket.emit('send-message', self.message);
        self.saySomething = '';
      };

    }

})();
