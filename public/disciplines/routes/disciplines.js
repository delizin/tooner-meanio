'use strict';

//Setting up route
angular.module('mean.disciplines').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // states for my app
    $stateProvider
      .state('all disciplines', {
        url: '/disciplines',
        templateUrl: 'public/disciplines/views/list.html'
      })
      .state('discipline by id', {
        url: '/disciplines/:disciplineId',
        templateUrl: 'public/disciplines/views/view.html'
      })
  }
])
