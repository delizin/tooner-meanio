'use strict';

//Setting up route
angular.module('mean.traits').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // states for my app
    $stateProvider
      .state('all traits', {
        url: '/traits',
        templateUrl: 'public/traits/views/list.html'
      })
      .state('trait by id', {
        url: '/traits/:traitId',
        templateUrl: 'public/traits/views/view.html'
      })
  }
])
