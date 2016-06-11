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
      'angularMoment'
    ])
    .config(['$httpProvider', '$stateProvider', '$urlRouterProvider', '$locationProvider', function($httpProvider, $stateProvider, $urlRouterProvider, $locationProvider) {
      
      $stateProvider
        .state('home', {
          url: '/',
          templateUrl: 'home/home.html',
          controller: 'homeCtrl',
          controllerAs: 'home',
          requiresLogin: false,
      });

      $stateProvider
        .state('video-chat', {
          url: '/video-chat',
          templateUrl: '/video-chat/video-chat.html',
          controller: 'videoChatCtrl',
          controllerAs: 'video',

      });

      $stateProvider
        .state('messages', {
          url: '/messages',
          templateUrl: '/messages/messages.html',
          controller: 'messageCtrl',
          controllerAs: 'msg',
      });

      $stateProvider
        .state('thread', {
          url: '/messages/:id',
          templateUrl: '/messages/messages.id.html',
          controller: 'messageCtrl',
          controllerAs: 'msg',
      });

      $stateProvider
        .state('settings', {
          url: '/settings',
          templateUrl: '/settings/settings.html',
          controller: 'settingsCtrl',
          controllerAs: 'settingsCtrl',
      });
      // $locationProvider.html5Mode(true).hashPrefix('!');   
      $urlRouterProvider.otherwise('/');
      
    }])
    .run(['$rootScope', 'authFact', 'localStorageService', '$state', '$location', 'msgFact', 'chatSocket', 'conToVidChat', function($rootScope, authFact, localStorageService, $state, $location, msgFact, chatSocket, conToVidChat) {
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, prevRoute, fromParams) {

        var localStore = localStorageService.get('dating-token');

        if (toState.name === 'home') {
          return;
        }

        if (!localStore) {
          console.log('not logged in');
          $state.go('home');
          event.preventDefault(); 
          return;       
        } else {
          var currentUser = localStore.username;
          authFact.setUser(currentUser);
        }     

        if (localStore !== null && toState.requiresLogin === false && prevRoute.name !== "") {
          console.log('hit');
          $state.go(prevRoute.name);
        }


        
        // sets us to online
        chatSocket.emit('connected', authFact.getTokenLocalStorage().token);

        // we dont want to accept calls if we're not on the correct view
        // toggles availability on server too
        // if (toState.name === 'video-chat' && !conToVidChat.getAvail()) {
        //   conToVidChat.isAvailToChat(true);
        // } else if (toState.name !== 'video-chat' && conToVidChat.getAvail()) {
        //   conToVidChat.isAvailToChat(false);
        // }
        
        // on page refresh gets thread id from local storage and makes request to server for thread
        if (toState.name === 'thread' && msgFact.getMessages().length === 0) {
          var id = msgFact.getThreadItems().threadId;
          msgFact.requestMessages(id);
          msgFact.setRequestForMessagesSent();
        }
  

            
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