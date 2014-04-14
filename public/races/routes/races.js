'use strict';

//Setting up route
angular.module('mean.races').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // states for my app
    $stateProvider
      .state('all races', {
        url: '/races',
        templateUrl: 'public/races/views/list.html'
      })
      .state('race by id', {
        url: '/races/:raceId',
        templateUrl: 'public/races/views/view.html'
      })
  }
])
