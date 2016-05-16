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
          controllerAs: 'homeCtrl'
      });

      $stateProvider
        .state('video-chat', {
          url: '/video-chat',
          templateUrl: '/video-chat/video-chat.html',
          controller: 'videoChatCtrl',
          controllerAs: 'vcCtrl',
          authenticate: true,
          resolve: {
            "currentAuth": ['$q', 'authFact', function($q, authFact) {
              var authenticatedUser = authFact.getUser();

              if (authenticatedUser) {
                return $q.when(authenticatedUser);
              } else {
                return $q.reject({authenticated: false});
              }
            }]
          }
      });

      $stateProvider
        .state('messages', {
          url: '/messages',
          templateUrl: '/messages/messages.html',
          controller: 'messageCtrl',
          controllerAs: 'messageCtrl'
      });

      $stateProvider
        .state('settings', {
          url: '/settings',
          templateUrl: '/settings/settings.html',
          controller: 'settingsCtrl',
          controllerAs: 'settingsCtrl',
          authenticate: true,
          resolve: {
            "currentAuth": ['$q', 'authFact', function($q, authFact) {
              var authenticatedUser = authFact.getUser();

              if (authenticatedUser) {
                return $q.when(authenticatedUser);
              } else {
                return $q.reject({authenticated: false});
              }
            }]
          }
      });
      // $locationProvider.html5Mode(true).hashPrefix('!');   
      $urlRouterProvider.otherwise('/');
      
    }])
    .run(['$rootScope', 'authFact', 'localStorageService', '$state', function($rootScope, authFact, localStorageService, $state) {
      $rootScope.$on('$stateChangeStart', function(event, toState) {

        var localStore = localStorageService.get('dating-token');

        if (toState.name === "home"){
          return;
        } 
        
        if (!localStore) {
          console.log('not logged in');
          
          event.preventDefault();        
        } else {
          var currentUser = localStore.currentUser;
          authFact.setUser(currentUser);
        }         
      });

    }]);
})();