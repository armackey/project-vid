(function() {
  'use strict';

  angular
    .module('app',[
      'ui.router',
      'angular-svg-round-progress',
      'addTime',
      'btford.socket-io',
      'LocalStorageModule',
      'vesparny.fancyModal'
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
        .state('messages.id', {
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
    .run(['$rootScope', 'authFact', 'localStorageService', '$state', function($rootScope, authFact, localStorageService, $state) {
      $rootScope.$on('$stateChangeStart', function(event, toState, toParams, prevRoute, fromParams) {

        var localStore = localStorageService.get('dating-token');

        if (localStore !== null && toState.requiresLogin === false && prevRoute.name !== "") {
          $state.go(prevRoute.name);
        }

        if (toState.name === 'home') {
          return;
        } 
  
        if (!localStore) {
          console.log('not logged in');
          $state.go('home');
          event.preventDefault();        
        } else {
          var currentUser = localStore.username;
          authFact.setUser(currentUser);
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