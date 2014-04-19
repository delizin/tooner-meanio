'use strict';

//Setting up route
angular.module('mean.statRunes').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // states for my app
    $stateProvider
      .state('all statRunes', {
        url: '/statRunes',
        templateUrl: 'public/statRunes/views/list.html'
      })
      .state('statRune by id', {
        url: '/statRunes/:statRuneId',
        templateUrl: 'public/statRunes/views/view.html'
      })
  }
])
