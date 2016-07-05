(function() {
  'use strict';

  angular
    .module('app',[
      'ui.router',
      'angular-svg-round-progress',
      'addTime',
      'takePic',
      'btford.socket-io',
      'LocalStorageModule',
      'vesparny.fancyModal',
      'luegg.directives',
      'angularMoment',
      // 'humanize-duration',
      // 'angularjs-humanize-duration',
      'timer',

      
    ])
    .config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function($httpProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
      
      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'home/home.html',
          controller: 'homeCtrl',
          controllerAs: 'home',
          requiresLogin: false
      });

      $stateProvider
        .state('video-chat', {
          url: '/video-chat',
          templateUrl: '/video-chat/video-chat.html',
          controller: 'videoChatCtrl',
          controllerAs: 'video',
          requiresLogin: true,
          resolve: {
            getTwilioToken: function(makeCall) {
              return makeCall.getTwilioToken();
            }
          }
      });

      $stateProvider
        .state('messages', {
          url: '/messages',
          templateUrl: '/messages/messages.html',
          controller: 'messageCtrl',
          controllerAs: 'msg',
          requiresLogin: true,
          // resolve: {
          //   getMessage: function(msgFact, authFact) {
          //     console.log('threads');
          //     var threadId = msgFact.getThreadItems().threadId;
          //     var userId = authFact.getTokenLocalStorage().userId;
          //     msgFact.requestMessages(threadId, userId);
          //     msgFact.setRequestForMessagesSent();
          //   }
          // }
      });

      // $stateProvider
      //   .state('messages.id', {
      //     url: '/messages/:id',
      //     templateUrl: '/messages/messages.html',
      //     controller: 'messageCtrl',
      //     controllerAs: 'msg',
      //     requiresLogin: true,
      //     resolve: {
      //       getMessage: function(msgFact, authFact) {
      //         console.log('threads');
      //         var threadId = msgFact.getThreadItems().threadId;
      //         var userId = authFact.getTokenLocalStorage().userId;
      //         msgFact.requestMessages(threadId, userId);
      //         msgFact.setRequestForMessagesSent();
      //       }
      //     }
      // });

      $stateProvider
        .state('thread', {
          url: '/messages/:id',
          templateUrl: '/messages/messages.id.html',
          controller: 'messageCtrl',
          controllerAs: 'msg',
          requiresLogin: true,
          // resolve: {
          //   getMessage: function(msgFact, authFact) {
          //     console.log('threads');
          //     var threadId = msgFact.getThreadItems().threadId;
          //     var userId = authFact.getTokenLocalStorage().userId;
          //     msgFact.requestMessages(threadId, userId);
          //     msgFact.setRequestForMessagesSent();
          //   }
          // }
      });

      $stateProvider
        .state('preferences', {
          url: '/preferences',
          templateUrl: '/settings/preferences.html',
          controller: 'settingsCtrl',
          controllerAs: 'settingsCtrl',
          requiresLogin: true
      });

      $stateProvider
        .state('myprofile', {
          url: '/my-profile',
          templateUrl: '/settings/my-profile.html',
          controller: 'settingsCtrl',
          controllerAs: 'settingsCtrl',
          requiresLogin: true
      });

      // $locationProvider.html5Mode(true).hashPrefix('!');   
      $urlRouterProvider.otherwise(function($injector) {
        var $state = $injector.get('$state');
        $state.go('home');
      });
      
    }])
    .run(['$rootScope', 'authFact', 'localStorageService', '$state', '$location', 'msgFact', 'chatSocket', 'conToVidChat', 'makeCall', function($rootScope, authFact, localStorageService, $state, $location, msgFact, chatSocket, conToVidChat, makeCall) {
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, prevRoute, fromParams) {

        var localStore = localStorageService.get('dating-token');
        var haveTwilToken = makeCall.returnTwiloStatus();
        var requiresLogin = false;


        if (toState.requiresLogin) {
          requiresLogin = true;
        }

        if (requiresLogin && !localStore) {
          event.preventDefault();
          $state.go('home');
        }

        if (localStore) {
          var currentUser = localStore.username;
          authFact.setUser(currentUser);
          chatSocket.emit('connected', authFact.getTokenLocalStorage().token);
        }

        // if (localStore !== null && toState.requiresLogin === false && prevRoute.name !== "") {
        //   console.log('hit');
        //   console.log(toState.name);
        //   // $state.go(prevRoute.name);
        // }

        
        

        // we dont want to accept calls if we're not on the correct view
        // toggles availability on server too
        // if (toState.name === 'video-chat' && !conToVidChat.getAvail()) {
        //   conToVidChat.isAvailToChat(true);
        // } else if (toState.name !== 'video-chat' && conToVidChat.getAvail()) {
        //   conToVidChat.isAvailToChat(false);
        // }
        
        // on page refresh gets thread id from local storage and makes request to server for thread
        // if (toState.name === 'thread' && msgFact.getMessages().length === 0) {
        //   var id = msgFact.getThreadItems().threadId;
        //   msgFact.requestMessages(id);
        //   msgFact.setRequestForMessagesSent();
        // }
  

            
      });

    }]);

    window.fbAsyncInit = function() {
      FB.init({
        appId      : '222504631415485',
        xfbml      : true,
        version    : 'v2.6'
      });
    };

    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "//connect.facebook.net/en_US/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));

})();