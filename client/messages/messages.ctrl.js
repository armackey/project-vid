(function() {
  'use strict';

  angular
    .module('app')
    .controller('messageCtrl', messageCtrl);

    messageCtrl.$inject = ['$http', 'chatSocket', 'authFact', 'msgFact', '$rootScope', '$scope'];
    
    function messageCtrl($http, chatSocket, authFact, msgFact, $rootScope, $scope) {

      var self = this,
          token = authFact.getTokenLocalStorage(),
          threadId = msgFact.getThreadItems().threadId;

      
      self.threads = [];
      self.messages = msgFact.getMessages();
      self.currentUser = authFact.getUser();
      self.otherUser = msgFact.getThreadItems() === null ? null : msgFact.getThreadItems().threadName;
      self.isChecked = false;
      self.noMessages = '';

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
          orderThreads(threads[i].messages, threads[i].id);
        }    
      });

      // will display last message sent from other users
      function orderThreads(messages, id) {
        for (var i = messages.length - 1; i >= 0; i--) {
          if (messages[i].from !== self.currentUser) {
            if (messages[i].unread) {
              msgFact.incrementMessageCount(); // setting our number of unread messages
            }
            self.threads.push({id: id, message: checkMessageLength(messages[i].message), from: messages[i].from, unread: messages[i].unread, date: messages[i].created_at});
            break;
          }
        }
      }

      function checkMessageLength(message) {
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

        self.threads.unshift({id: newThread.id, message: checkMessageLength(newThread.message), from: newThread.from, unread: newThread.unread, date: newThread.created_at});

      }
      
      self.threadClicked = function(id, threadName) {  
        msgFact.requestMessages(id);
        msgFact.storeThreadItems({threadId: id, threadName: threadName});
        threadId = id;
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
          id: msgFact.getThreadItems().threadId,
          created_at: Date.now()
        };

        self.messages.push({message: self.message.message, from: self.message.from, date: self.message.created_at});

        chatSocket.emit('send-message', self.message);
        self.saySomething = '';
      };

    }

})();
