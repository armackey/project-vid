(function() {
  'use strict';

  angular
    .module('app')
    .controller('messageCtrl', messageCtrl);

    messageCtrl.$inject = ['$http', 'chatSocket', 'authFact', 'msgFact', '$rootScope', '$scope', '$timeout', '$interval', 'moment'];
    
    function messageCtrl($http, chatSocket, authFact, msgFact, $rootScope, $scope, $timeout, $interval, moment) {

      var self = this,
          otherId,
          otherPhotos,
          myPhotos,
          mytimeout,
          duration,
          timeLeft,
          isCaller = false,
          threadId = msgFact.getThreadItems() === null ? null : msgFact.getThreadItems().threadId,
          username = authFact.getTokenLocalStorage() === null ? null : authFact.getTokenLocalStorage().username,
          userId = authFact.getTokenLocalStorage() === null ? null : authFact.getTokenLocalStorage().userId;

      self.threads = [];
      self.messagesArray = [];
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
        console.log(data);
        if (data.answer) {
         var msg = self.messagesArray.filter(function(elem) {
            if (elem.id === data.id) {
              console.log(elem);
            }
            return elem.id === data.id;
          });
         msg.answer = data.answer;
         msg.message = 'test';
         console.log(msg);
        }

        if (data.from === self.currentUser) {
          return; 
        }

        self.messagesArray.push({message: data.message, from: data.from, date: handleExpireCounter(data.created_at), pending_call: data.pending_call});
        findAndUpdateThread(data);
        
        if (data.threadId !== threadId) { // if user is on current thread, they should not see message incrementing
          msgFact.incrementMessageCount();  
        }
      });

      msgFact.requestMessages(threadId, userId).then(function(data) {
        var content = data.data.content;

        if (content === undefined) {
          return;
        }
        for (var i = 0; i < content.messages.length; i++) {
          if (!content.messages[i].message) continue;
          // if (content.messages[i].unread && newMessageCount > 0) {
          //   newMessageCount--;
          // }

          if (userId !== content.messages[i].user_id) {
            otherId = content.messages[i].user_id;  
          }

          self.messagesArray.push({
            message: content.messages[i].message, 
            from: content.messages[i].from, 
            date: content.messages[i].created_at,
            pending_call: content.messages[i].pending_call,
            id: content.messages[i]._id,
            expired: content.messages[i].expired,
            expiresIn: handleExpireCounter(content.messages[i]),
            denied: content.messages[i].denied,
            videoRequest: content.messages[i].video_request,
            // myPhoto: self.orderPhotos(content.users, userId), 
            // otherPhotos: self.orderPhotos(content.users, userId)
          });

          $rootScope.$emit('new-message-count');
        }

      });

      function handleExpireCounter(time) {
        if (time.expired || time.denied) {
          return;
        }
        var createdAt = parseInt(moment(time.created_at).format('x')) + 300000;
        var now = parseInt(moment(Date.now()).format('x'));
        
        mytimeout = $timeout(onTimeout,1000);
        
        if (createdAt - now > 0) {
          timeLeft = createdAt - now;
        } else {
          cancelTick();
          return;
        }
      }

      function onTimeout() {

        duration = moment.duration(timeLeft);
        var expires = moment.utc(duration.asMilliseconds()).format("mm:ss");

        // console.log(expires, 'expires');
        // console.log(timeLeft, 'timeLeft');

        mytimeout = $timeout(onTimeout,1000);

        if (timeLeft <= 0) {
          cancelTick();
        } 
        timeLeft--;
      }

      function cancelTick() {
        $timeout.cancel(mytimeout);
        return;
      }


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
            self.threads.push({
              id: id, 
              message: checkMessageLength(messages[i].message), 
              from: messages[i].from, 
              unread: messages[i].unread, 
              date: messages[i].created_at, 
              otherPhotos: self.otherPhoto, 
              myPhotos: self.myPhoto});
            break;
          }
        }
      }

      function orderPhotos(photos, userId) {
        for (var i = 0; i < photos.length; i++) {
          if (photos[i].userId !== userId) {
            otherId = photos[i].userId;
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
        self.threads.unshift({
          id: newThread.id, 
          message: checkMessageLength(newThread.message), 
          from: newThread.from, 
          unread: newThread.unread, 
          date: newThread.created_at, 
          otherPhotos: newThread.otherPhoto, 
          myPhotos: newThread.myPhoto
        });
      }

      self.call = function() {


        self.message = {
          message: 'A video call request was made to ' + self.otherUser + '. From ' + self.currentUser + '. Waiting for response. -Blur',
          unread: true,
          pending_call: true,
          from: authFact.getUser(),
          otherPhoto: self.otherPhoto,
          myPhoto: self.myPhoto,
          threadId: msgFact.getThreadItems().threadId,
          created_at: Date.now(),
          userId: userId,
          videoRequest: true
        };

        self.messagesArray.forEach(function(msg) {
          if (msg.date > 0) {
            console.log(msg);
            return;
          } 
        });

        self.messagesArray.push({message: self.message.message, from: self.message.from, date: handleExpireCounter(self.message.created_at), pending_call: true, videoRequest: true});
        chatSocket.emit('send-message', self.message);
        chatSocket.emit('request-call-invite', {receiver: {id: otherId}, caller: {id: userId, name: username}, pending_call: true});

        // $scope.$emit('request-call-invite', {receiver: {id: otherId}, caller: {id: userId, name: username}, pending_call: true});
      };


      self.acceptVideoCall = function(msgId) {
        self.messagesArray.forEach(function(elem) {
          if (elem.id === msgId) {
            elem.pending_call = false; // switches to CONNECTING
          }
        });
        // chatSocket.emit('send-message', {msgId: messageId, answered: true});
        // $scope.$emit('video-call-response', {receiver: {id: userId}, caller: {id: otherId}, answer: 'yes'});
        chatSocket.emit('video-call-response', {receiver: {id: userId}, caller: {id: otherId, name: username}, answered: true, threadId: threadId, messageId: msgId, pending_call: false});
      };

      self.declineVideoCall = function(msgId) {
        self.messagesArray.forEach(function(elem) {
          if (elem.id === msgId) {
            elem.denied = true; // switches to DENIED
          }
        });
        chatSocket.emit('video-call-response', {receiver: {id: userId}, caller: {id: otherId}, answered: false, threadId: threadId, messageId: msgId, denied: true, pending_call: true});
      };

      chatSocket.on('accept-decline-response-message', function(data) {
        self.messagesArray.forEach(function(elem) {
          if (elem.id === data.messageId) {
            elem.denied = data.denied;
            elem.pending_call = data.pending_call;
            elem.answered = data.answered;
          }
        });
      });

      
      self.threadClicked = function(id, threadName) {  
        threadId = id;
        console.log(threadName);
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
          threadId: msgFact.getThreadItems().threadId,
          created_at: Date.now(),
          userId: userId
        };

        self.messagesArray.push({message: self.message.message, from: self.message.from, date: self.message.created_at});

        chatSocket.emit('send-message', self.message);
        self.saySomething = '';
      };

    }

})();
