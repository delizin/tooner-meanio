'use strict';

//Setting up route
angular.module('mean.prestiges').config(['$stateProvider', '$urlRouterProvider',
  function($stateProvider, $urlRouterProvider) {
    // states for my app
    $stateProvider
      .state('all prestiges', {
        url: '/prestiges',
        templateUrl: 'public/prestiges/views/list.html'
      })
      .state('prestige by id', {
        url: '/prestiges/:prestigeId',
        templateUrl: 'public/prestiges/views/view.html'
      })
  }
])
