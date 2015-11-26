// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('upet', ['ionic',
 'upet.controllers',
 'parse-angular',
 'parse-angular.enhance',
 'upet.factory',
 'upet.services.authentication',
 'upet.services.pets',
  'ionic-datepicker',
  'ngCordova',
  'uiGmapgoogle-maps'
 ])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
   // Initialise Parse
  Parse.initialize("pGjRYW5wooTCRNAX9zEtXZn3YeExbeBjSsA1I7KT", "JZoYvYpIQXn1dhpM7nE2tT5wT7Rn4cBtfCZwJVBK");  
})
.run(['$rootScope', 'AuthFactory','$window',
    function($rootScope, AuthFactory, $window) {

        $rootScope.userEmail = null;
        var currentUser = Parse.User.current();
  
        if (currentUser) {
            $rootScope.isAuthenticated = true;
            $rootScope.user = currentUser;
            $window.location.href = '#/app/welcome';
        }
        // utility method to convert number to an array of elements
        $rootScope.getNumber = function(num) {
            return new Array(num);
        }

    }
])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })
    .state('app.welcome', {
      url: '/welcome',
      views: {
        'menuContent': {
          templateUrl: 'templates/welcome.html'
        }
      }
    })
  .state('app.petlist', {
    url: '/petlist',
    views: {
      'menuContent': {
        templateUrl: 'templates/petlist.html',
        controller: 'PetlistsCtrl'
      }
    }
  })
   .state('app.detailpet', {
    url: '/detailpet',
    views: {
      'menuContent': {
        templateUrl: 'templates/detailpet.html',
        controller: 'detailCtrl'
      }
    }
  })
   .state('app.newPet', {
      url: '/newpet',
      views: {
        'menuContent': {
          templateUrl: 'templates/newPet.html',
          controller: 'newCtrl'
        }
      }
    })
   .state('app.editPet', {
      url: '/editpet',
      views: {
        'menuContent': {
          templateUrl: 'templates/editPet.html',
          controller: 'editCtrl'
        }
      }
    })
   .state('app.locations', {
      url: '/locations',
      views: {
        'menuContent': {
          templateUrl: 'templates/locations.html',
          controller: 'locationsCtrl'
        }
      }
    });

 
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/welcome');
});
