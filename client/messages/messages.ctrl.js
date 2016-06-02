(function() {
  'use strict';

  angular
    .module('app')
    .controller('messageCtrl', messageCtrl);

    messageCtrl.$inject = ['$http', 'chatSocket', 'authFact', 'msgFact'];
    
    function messageCtrl($http, chatSocket, authFact, msgFact) {

      var self = this,
          token = authFact.getTokenLocalStorage();

      
      self.threads = [];
      self.messages = msgFact.getMessages();
      self.currentUser = authFact.getUser();
      self.otherUser = msgFact.getThreadItems().threadName;


      chatSocket.on('message-receive', function(data) {
        self.messages.push(data);
        console.log(data);
      });

      msgFact.requestThreads().then(function(data) {
        var threads = data.data;
        for (var i = 0; i < threads.length; i++) {
          orderThreads(threads[i].messages, threads[i].id);
        }    
      });

      // will display last message sent from other user
      function orderThreads(messages, id) {
        for (var i = messages.length - 1; i >= 0; i--) {
          if (messages[i].from !== self.currentUser) {
            self.threads.push({id: id, message: messages[i].message, from: messages[i].from});
            break;
          }
        }
      }
      
      self.threadClicked = function(id, threadName) {  
        msgFact.requestMessages(id);
        msgFact.storeThreadItems({threadId: id, threadName: threadName});
      };

      self.sendMessage = function() {
        if (self.saySomething === '' || self.saySomething === undefined) {
          return;
        }

        self.message = {
          from: authFact.getUser(),
          message: self.saySomething,
          threadId: msgFact.getThreadItems().threadId
        };

        self.messages.push(self.message);

        chatSocket.emit('send-message', self.message);
        self.saySomething = '';
      };

    }

})();
